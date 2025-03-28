'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlayerWithId } from '@/types/player';

interface PlayerComparisonProps {
  players: PlayerWithId[];
  onMatchResult: (winnerId: string, loserId: string, voterId: string) => void;
  dateRange: string;
}

export default function PlayerComparison({ players, onMatchResult, dateRange }: PlayerComparisonProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<[PlayerWithId | null, PlayerWithId | null]>([null, null]);
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticatedPlayer, setAuthenticatedPlayer] = useState<PlayerWithId | null>(null);
  
  // Clear selections if players list changes
  useEffect(() => {
    setSelectedPlayers([null, null]);
  }, [players]);
  
  // Handle player selection
  const handlePlayerClick = (player: PlayerWithId) => {
    // If this player is already selected, deselect it
    if (selectedPlayers[0]?._id.toString() === player._id.toString()) {
      setSelectedPlayers([null, selectedPlayers[1]]);
      return;
    }
    
    if (selectedPlayers[1]?._id.toString() === player._id.toString()) {
      setSelectedPlayers([selectedPlayers[0], null]);
      return;
    }
    
    // If no player selected, put on left side
    if (!selectedPlayers[0]) {
      setSelectedPlayers([player, selectedPlayers[1]]);
      return;
    }
    
    // If left filled but right empty, put on right side
    if (!selectedPlayers[1]) {
      setSelectedPlayers([selectedPlayers[0], player]);
      return;
    }
    
    // If both slots full, replace the right player
    setSelectedPlayers([selectedPlayers[0], player]);
  };
  
  // Handle authentication
  const handleAuthenticate = async () => {
    try {
      setAuthError(null);
      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        setAuthError(data.error || 'Authentication failed');
        setAuthenticatedPlayer(null);
        return;
      }
      
      // Find the authenticated player in our players list
      const player = players.find(p => p._id.toString() === data.playerId);
      
      if (player) {
        setAuthenticatedPlayer(player);
        setAuthError(null);
      } else {
        setAuthError('Player not found');
        setAuthenticatedPlayer(null);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('Authentication failed');
      setAuthenticatedPlayer(null);
    }
  };
  
  // Declare winner (left or right player)
  const declareWinner = async (winnerSlot: 0 | 1) => {
    const loserSlot = winnerSlot === 0 ? 1 : 0;
    
    if (!authenticatedPlayer) {
      setAuthError('Please authenticate with your password first');
      return;
    }
    
    if (selectedPlayers[winnerSlot] && selectedPlayers[loserSlot]) {
      // Check if trying to vote for yourself
      if (
        authenticatedPlayer._id.toString() === selectedPlayers[winnerSlot]._id.toString() ||
        authenticatedPlayer._id.toString() === selectedPlayers[loserSlot]._id.toString()
      ) {
        setAuthError('You cannot vote for yourself');
        return;
      }
      
      onMatchResult(
        selectedPlayers[winnerSlot]!._id.toString(),
        selectedPlayers[loserSlot]!._id.toString(),
        authenticatedPlayer._id.toString()
      );
      
      // Clear selections after recording the result
      setSelectedPlayers([null, null]);
    }
  };
  
  // Handle password input
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setAuthError(null);
  };
  
  // Handle submitting form on enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAuthenticate();
    }
  };
  
  return (
    <div className="mb-12">
      {/* Authentication UI */}
      <div className="mb-8 p-4 border-2 border-black">
        <h3 className="text-xl font-bold mb-2">Authentication</h3>
        
        {authenticatedPlayer ? (
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-black text-white font-bold">
              Logged in as {authenticatedPlayer.name}
            </div>
            <button 
              onClick={() => setAuthenticatedPlayer(null)}
              className="px-4 py-2 border-2 border-black hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              className="p-2 border-2 border-black"
            />
            <button 
              onClick={handleAuthenticate}
              className="px-4 py-2 border-2 border-black hover:bg-gray-100"
            >
              Login
            </button>
          </div>
        )}
        
        {authError && (
          <div className="mt-2 text-red-500 font-bold">
            {authError}
          </div>
        )}
      </div>
      
      {/* Use the player-comparison class from globals.css */}
      <div className="player-comparison mb-8 relative">
        {/* Left Player Card */}
        <div className="player-card">
          {!selectedPlayers[0] ? (
            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded p-4">
              <p className="text-gray-500 text-lg">Select a player</p>
            </div>
          ) : (
            <>
              <div style={{ width: '200px', height: '200px' }} className="mb-4">
                <Image 
                  src={selectedPlayers[0].imageUrl}
                  alt={selectedPlayers[0].name}
                  width={200}
                  height={200}
                  className="player-image"
                  priority
                />
              </div>
              <h3 className="text-4xl font-bold mt-4 mb-2">{selectedPlayers[0].name}</h3>
              <p className="text-2xl mb-4">Elo: {selectedPlayers[0].currentElo}</p>
              {selectedPlayers[0] && selectedPlayers[1] && authenticatedPlayer && (
                <button
                  onClick={() => declareWinner(0)}
                  className="py-2 px-8 border-2 border-black text-xl font-bold hover:bg-gray-100"
                  disabled={!authenticatedPlayer}
                >
                  Winner
                </button>
              )}
            </>
          )}
        </div>
        
        {/* VS Text */}
        <div className="vs">VS</div>
        
        {/* Right Player Card */}
        <div className="player-card">
          {!selectedPlayers[1] ? (
            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded p-4">
              <p className="text-gray-500 text-lg">Select a player</p>
            </div>
          ) : (
            <>
              <div style={{ width: '200px', height: '200px' }} className="mb-4">
                <Image 
                  src={selectedPlayers[1].imageUrl}
                  alt={selectedPlayers[1].name}
                  width={200}
                  height={200}
                  className="player-image"
                  priority
                />
              </div>
              <h3 className="text-4xl font-bold mt-4 mb-2">{selectedPlayers[1].name}</h3>
              <p className="text-2xl mb-4">Elo: {selectedPlayers[1].currentElo}</p>
              {selectedPlayers[0] && selectedPlayers[1] && authenticatedPlayer && (
                <button
                  onClick={() => declareWinner(1)}
                  className="py-2 px-8 border-2 border-black text-xl font-bold hover:bg-gray-100"
                  disabled={!authenticatedPlayer}
                >
                  Winner
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Selection */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Compare Videos ({dateRange})</h2>
        </div>
        
        {/* Player Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {players.map(player => (
            <button
              key={player._id.toString()}
              onClick={() => handlePlayerClick(player)}
              className={`p-2 border-2 ${
                selectedPlayers[0]?._id.toString() === player._id.toString() ||
                selectedPlayers[1]?._id.toString() === player._id.toString()
                  ? 'border-black bg-gray-100'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 relative overflow-hidden rounded-sm bg-gray-100">
                  <Image
                    src={player.imageUrl}
                    alt={player.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="font-bold">{player.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}