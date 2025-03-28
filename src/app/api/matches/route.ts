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
      .populate('loserId', 'name');
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

// POST /api/matches - Record a match result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.winnerId || !body.loserId) {
      return NextResponse.json({ 
        error: 'Winner ID and loser ID are required' 
      }, { status: 400 });
    }
    
    if (body.winnerId === body.loserId) {
      return NextResponse.json({ 
        error: 'Winner and loser cannot be the same player' 
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
    
    if (!winner || !loser) {
      return NextResponse.json({ 
        error: 'Winner or loser not found' 
      }, { status: 404 });
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
    return NextResponse.json({ error: 'Failed to record match' }, { status: 500 });
  }
}