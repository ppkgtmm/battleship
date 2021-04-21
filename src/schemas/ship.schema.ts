import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Coordinate, CoordSchema } from './coordinate.schema';
import { ShipType } from '../shared';

export type ShipDocument = Ship & Document;

@Schema()
export class Ship {
  @Prop({ required: true, ref: 'Game', type: Types.ObjectId })
  game: string;

  @Prop({ required: true })
  type: ShipType;

  @Prop({ required: true, type: [CoordSchema] })
  coordinates: Coordinate[];

  @Prop({ default: false })
  is_sunk: boolean;

  @Prop({ default: new Date() })
  placed_time: Date;
}

export const ShipSchema = SchemaFactory.createForClass(Ship);
