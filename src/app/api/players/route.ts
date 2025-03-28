import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';

// GET /api/players - Get all players sorted by currentElo (descending)
export async function GET() {
  try {
    await connectToDatabase();
    const players = await Player.find({}).sort({ currentElo: -1 });
    return NextResponse.json(players);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

// POST /api/players - Create a new player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Check if player already exists
    const existingPlayer = await Player.findOne({ name: body.name });
    if (existingPlayer) {
      return NextResponse.json({ error: 'Player already exists' }, { status: 400 });
    }
    
    // Create new player with initial Elo rating of 1500
    const player = new Player({
      name: body.name,
      currentElo: 1500,
      imageUrl: body.imageUrl || '/images/default-profile.jpg',
      eloHistory: [{ week: 1, elo: 1500 }]
    });
    
    await player.save();
    return NextResponse.json(player, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}