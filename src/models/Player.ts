import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  currentElo: number;
  eloHistory: {
    year: number;
    week: number;
    elo: number;
    date: Date;
  }[];
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    currentElo: { type: Number, default: 1500 },
    eloHistory: [
      {
        year: { type: Number, required: true },
        week: { type: Number, required: true },
        elo: { type: Number, required: true },
        date: { type: Date, default: Date.now }
      }
    ],
    imageUrl: { type: String, default: '/images/default-profile.jpg' }
  },
  { timestamps: true }
);

// Prevent reinitializing the model if it already exists
export default mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema); 