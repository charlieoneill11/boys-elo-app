'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlayerWithId } from '@/types/player';

interface PlayerComparisonProps {
  players: PlayerWithId[];
  onMatchResult: (winnerId: string, loserId: string) => void;
  dateRange: string;
}

export default function PlayerComparison({ players, onMatchResult, dateRange }: PlayerComparisonProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<[PlayerWithId | null, PlayerWithId | null]>([null, null]);
  
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
  
  // Declare winner (left or right player)
  const declareWinner = (winnerSlot: 0 | 1) => {
    const loserSlot = winnerSlot === 0 ? 1 : 0;
    
    if (selectedPlayers[winnerSlot] && selectedPlayers[loserSlot]) {
      onMatchResult(
        selectedPlayers[winnerSlot]!._id.toString(),
        selectedPlayers[loserSlot]!._id.toString()
      );
      
      // Clear selections after recording the result
      setSelectedPlayers([null, null]);
    }
  };
  
  return (
    <div className="mb-12">
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
              {selectedPlayers[0] && selectedPlayers[1] && (
                <button
                  onClick={() => declareWinner(0)}
                  className="py-2 px-8 border-2 border-black text-xl font-bold"
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
              {selectedPlayers[0] && selectedPlayers[1] && (
                <button
                  onClick={() => declareWinner(1)}
                  className="py-2 px-8 border-2 border-black text-xl font-bold"
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