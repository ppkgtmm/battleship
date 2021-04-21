import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CoordDocument = Coordinate & Document;

@Schema({ _id: false })
export class Coordinate {
  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop({ default: false })
  is_hit: boolean;

  @Prop({ default: null })
  hit_time: Date;
}

export const CoordSchema = SchemaFactory.createForClass(Coordinate);
