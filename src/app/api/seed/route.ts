import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Player from '@/models/Player';
import { getCurrentWeek } from '@/lib/date-utils';

// Get current week and year
const { weekNumber, year } = getCurrentWeek();

const initialPlayers = [
  {
    name: 'Max Kirkby',
    currentElo: 1500,
    imageUrl: '/images/max.jpg',
    eloHistory: [{ year, week: weekNumber, elo: 1500, date: new Date() }]
  },
  {
    name: 'Will Dixson',
    currentElo: 1500,
    imageUrl: '/images/will.jpg',
    eloHistory: [{ year, week: weekNumber, elo: 1500, date: new Date() }]
  },
  {
    name: 'Loki Bromilow',
    currentElo: 1500,
    imageUrl: '/images/loki.jpg',
    eloHistory: [{ year, week: weekNumber, elo: 1500, date: new Date() }]
  },
  {
    name: 'Charlie O\'Neill',
    currentElo: 1500,
    imageUrl: '/images/charlie.jpg',
    eloHistory: [{ year, week: weekNumber, elo: 1500, date: new Date() }]
  }
];

// GET /api/seed - Initialize the database with default players
export async function GET() {
  try {
    await connectToDatabase();
    
    // Clear existing players
    await Player.deleteMany({});
    
    // Insert initial players
    await Player.insertMany(initialPlayers);
    
    return NextResponse.json({ 
      message: 'Database seeded successfully',
      note: 'Add player images to public/images with names: max.jpg, will.jpg, loki.jpg, charlie.jpg'
    }, { status: 200 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
} 