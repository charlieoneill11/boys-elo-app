'use client';

import { useState, useEffect, useCallback } from 'react';
import PlayerComparison from '@/components/PlayerComparison';
import EloLeaderboard from '@/components/EloLeaderboard';
import EloChart from '@/components/EloChart';
import { PlayerWithId } from '@/types/player';
import { getCurrentWeek } from '@/lib/date-utils';

export default function Home() {
  const [players, setPlayers] = useState<PlayerWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const currentWeek = getCurrentWeek();
  
  // Fetch players from the API
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players');
      
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      
      const data = await response.json();
      setPlayers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Handle match result
  const handleMatchResult = async (winnerId: string, loserId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId,
          loserId,
          year: currentWeek.year,
          week: currentWeek.weekNumber
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to record match result');
      }
      
      // Refresh players data to get updated Elo ratings
      await fetchPlayers();
    } catch (err) {
      console.error('Error recording match result:', err);
      setError('Failed to record match result. Please try again.');
      setLoading(false);
    }
  };
  
  // Load players on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        const playersResponse = await fetch('/api/players');
        
        if (playersResponse.ok) {
          const data = await playersResponse.json();
          
          if (data.length === 0) {
            // No players found, seed the database
            setLoading(true);
            const seedResponse = await fetch('/api/seed');
            
            if (seedResponse.ok) {
              await fetchPlayers();
            } else {
              throw new Error('Failed to seed database');
            }
          } else {
            // Players exist, just fetch them
            setPlayers(data);
            setLoading(false);
          }
        } else {
          // API error, try to initialize
          setLoading(true);
          const seedResponse = await fetch('/api/seed');
          
          if (seedResponse.ok) {
            await fetchPlayers();
          } else {
            throw new Error('Failed to initialize app');
          }
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load initial data. Please try again.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchPlayers]);
  
  // Calculate maximum weeks for chart
  const maxWeeks = 10; // Show up to 10 weeks on the chart
  
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Boys Elo Rating App</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <PlayerComparison 
            players={players} 
            onMatchResult={handleMatchResult} 
            dateRange={currentWeek.dateRange} 
          />
          
          <EloLeaderboard players={players} />
          
          <EloChart players={players} maxWeeks={maxWeeks} />
        </>
      )}
    </main>
  );
}