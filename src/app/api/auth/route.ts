import { NextRequest, NextResponse } from 'next/server';
import Player from '@/models/Player';
import connectToDatabase from '@/lib/db';

// The password map for each player
const PLAYER_PASSWORDS: Record<string, string> = {
  'Will Dixson': 'yep.',
  'Loki Bromilow': 'maxking',
  'Max Kirkby': 'twink',
  'Charlie O\'Neill': 'lebron'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.password) {
      return NextResponse.json({ 
        success: false,
        error: 'Password is required'
      }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Find all players
    const players = await Player.find({});
    
    // Find the player whose password matches
    const authenticatedPlayer = players.find(
      player => PLAYER_PASSWORDS[player.name] === body.password
    );
    
    if (!authenticatedPlayer) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid password'
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      playerId: authenticatedPlayer._id,
      playerName: authenticatedPlayer.name
    });
    
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 });
  }
}