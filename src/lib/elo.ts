// K factor determines how much a single match affects the rating
const K_FACTOR = 32;

// Calculate expected score for player A
export function getExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Calculate new Elo ratings for both players
export function calculateNewRatings(
  winnerRating: number,
  loserRating: number
): { newWinnerRating: number; newLoserRating: number; winnerChange: number; loserChange: number } {
  const expectedScoreWinner = getExpectedScore(winnerRating, loserRating);
  const expectedScoreLoser = getExpectedScore(loserRating, winnerRating);
  
  // Actual scores: 1 for winner, 0 for loser
  const actualScoreWinner = 1;
  const actualScoreLoser = 0;
  
  // Calculate Elo changes
  const winnerChange = Math.round(K_FACTOR * (actualScoreWinner - expectedScoreWinner));
  const loserChange = Math.round(K_FACTOR * (actualScoreLoser - expectedScoreLoser));
  
  // Calculate new ratings
  const newWinnerRating = winnerRating + winnerChange;
  const newLoserRating = loserRating + loserChange;
  
  return {
    newWinnerRating,
    newLoserRating,
    winnerChange,
    loserChange
  };
} 