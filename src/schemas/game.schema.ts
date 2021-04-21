import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
  @Prop({ required: true })
  defender_id: string;

  @Prop({ default: null })
  attacker_id: string;

  // to keep track of how many ships defender has placed so far
  @Prop({ default: 0 })
  battleship: number;

  @Prop({ default: 0 })
  cruiser: number;

  @Prop({ default: 0 })
  destroyer: number;

  @Prop({ default: 0 })
  submarine: number;

  @Prop({ default: 0 })
  total_ships: number;

  @Prop({ default: false })
  game_over: boolean;

  @Prop({ default: 0 })
  ship_sunk: number;

  // total moves = hit_count + miss_count
  // attacks on duplicate coordinates not allowed

  @Prop({ default: 0 })
  hit_count: number;

  @Prop({ default: 0 })
  miss_count: number;
}

export const GameSchema = SchemaFactory.createForClass(Game);
