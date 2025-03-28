import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import Match from '@/models/Match';
import { calculateNewRatings } from '@/lib/elo';
import { getCurrentWeek } from '@/lib/date-utils';

// GET /api/matches - Get all matches
export async function GET() {
  try {
    await connectToDatabase();
    const matches = await Match.find({})
      .sort({ year: -1, week: -1, createdAt: -1 })
      .populate('winnerId', 'name')
      .populate('loserId', 'name')
      .populate('voterId', 'name');
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

// POST /api/matches - Record a match result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.winnerId || !body.loserId || !body.voterId) {
      return NextResponse.json({ 
        error: 'Winner ID, loser ID, and voter ID are required' 
      }, { status: 400 });
    }
    
    if (body.winnerId === body.loserId) {
      return NextResponse.json({ 
        error: 'Winner and loser cannot be the same player' 
      }, { status: 400 });
    }
    
    // Check if voter is trying to vote for themselves
    if (body.voterId === body.winnerId || body.voterId === body.loserId) {
      return NextResponse.json({ 
        error: 'You cannot vote for yourself' 
      }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Get current week info if not provided
    const { year, weekNumber: week } = body.year && body.week 
      ? { year: body.year, weekNumber: body.week } 
      : getCurrentWeek();
    
    // Get winner and loser from database
    const winner = await Player.findById(body.winnerId);
    const loser = await Player.findById(body.loserId);
    const voter = await Player.findById(body.voterId);
    
    if (!winner || !loser || !voter) {
      return NextResponse.json({ 
        error: 'Winner, loser, or voter not found' 
      }, { status: 404 });
    }
    
    // Check if this voter has already voted for this pair in this week
    const existingVote = await Match.findOne({
      voterId: voter._id,
      year,
      week,
      $or: [
        { winnerId: winner._id, loserId: loser._id },
        { winnerId: loser._id, loserId: winner._id }
      ]
    });
    
    if (existingVote) {
      return NextResponse.json({ 
        error: 'You have already voted for this pair of players this week' 
      }, { status: 400 });
    }
    
    // Calculate new Elo ratings
    const { 
      newWinnerRating, 
      newLoserRating, 
      winnerChange, 
      loserChange 
    } = calculateNewRatings(winner.currentElo, loser.currentElo);
    
    // Create match record
    const match = new Match({
      year,
      week,
      winnerId: winner._id,
      loserId: loser._id,
      voterId: voter._id, // Add voter ID
      winnerEloChange: winnerChange,
      loserEloChange: loserChange,
      winnerEloAfter: newWinnerRating,
      loserEloAfter: newLoserRating
    });
    
    // Update player ratings
    winner.currentElo = newWinnerRating;
    winner.eloHistory.push({
      year,
      week,
      elo: newWinnerRating,
      date: new Date()
    });
    
    loser.currentElo = newLoserRating;
    loser.eloHistory.push({
      year,
      week,
      elo: newLoserRating,
      date: new Date()
    });
    
    // Save changes to database
    await Promise.all([
      match.save(),
      winner.save(),
      loser.save()
    ]);
    
    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error(error);
    
    // Check if this is a duplicate key error (duplicate vote)
    if (error instanceof Error && error.name === 'MongoServerError' && (error as any).code === 11000) {
      return NextResponse.json({ 
        error: 'You have already voted for this pair of players this week' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to record match' }, { status: 500 });
  }
}