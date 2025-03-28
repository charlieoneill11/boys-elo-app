'use client';

import { PlayerWithId } from '@/types/player';

interface EloLeaderboardProps {
  players: PlayerWithId[];
}

export default function EloLeaderboard({ players }: EloLeaderboardProps) {
  // Sort players by Elo rating (descending)
  const sortedPlayers = [...players].sort((a, b) => b.currentElo - a.currentElo);
  
  return (
    <div className="mb-12">
      <h2 className="text-5xl font-bold mb-4">Elo Leaderboard</h2>
      
      <div className="border-2 border-black">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="p-4 text-left font-bold text-2xl">#</th>
              <th className="p-4 text-left font-bold text-2xl">Player</th>
              <th className="p-4 text-right font-bold text-2xl">Elo</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player._id.toString()} className={index < sortedPlayers.length - 1 ? "border-b border-black" : ""}>
                <td className="p-4 text-xl">{index + 1}</td>
                <td className="p-4 text-xl font-bold">{player.name}</td>
                <td className="p-4 text-xl text-right">{player.currentElo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 