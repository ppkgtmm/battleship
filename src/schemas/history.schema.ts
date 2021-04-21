import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Coordinate, CoordSchema } from './coordinate.schema';

export type HistoryDocument = History & Document;

@Schema()
export class History {
  @Prop({ required: true, ref: 'Game', type: Types.ObjectId })
  game: string;

  @Prop({ type: [CoordSchema], default: [] })
  coord_hit: Array<Coordinate>; // attacked coordinates
}

export const HistorySchema = SchemaFactory.createForClass(History);
