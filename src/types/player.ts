import { Types } from 'mongoose';
import { IPlayer } from '@/models/Player';

export interface PlayerWithId extends IPlayer {
  _id: Types.ObjectId;
} 