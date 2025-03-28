import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  year: number;
  week: number;
  winnerId: mongoose.Types.ObjectId;
  loserId: mongoose.Types.ObjectId;
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
    winnerEloChange: { type: Number, required: true },
    loserEloChange: { type: Number, required: true },
    winnerEloAfter: { type: Number, required: true },
    loserEloAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

// Prevent reinitializing the model if it already exists
export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema); 