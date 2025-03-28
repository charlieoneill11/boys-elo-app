import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  year: number;
  week: number;
  winnerId: mongoose.Types.ObjectId;
  loserId: mongoose.Types.ObjectId;
  voterId: mongoose.Types.ObjectId; // Added field to track who voted
  winnerEloChange: number;
  loserEloChange: number;
  winnerEloAfter: number;
  loserEloAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema = new Schema(
  {
    year: { type: Number, required: true },
    week: { type: Number, required: true },
    winnerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    loserId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    voterId: { type: Schema.Types.ObjectId, ref: 'Player', required: true }, // Added field
    winnerEloChange: { type: Number, required: true },
    loserEloChange: { type: Number, required: true },
    winnerEloAfter: { type: Number, required: true },
    loserEloAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

// Create a compound index to prevent duplicate votes in the same week
// This index checks if a voter has already voted on the exact same pair
MatchSchema.index({ 
  voterId: 1, 
  year: 1, 
  week: 1,
  winnerId: 1, 
  loserId: 1
}, { unique: true });

// Prevent reinitializing the model if it already exists
export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);