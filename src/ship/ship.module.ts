import { Module } from '@nestjs/common';
import { ShipService } from './ship.service';
import { Ship, ShipSchema } from '../schemas';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ship.name, schema: ShipSchema }]),
  ],
  providers: [ShipService],
  exports: [ShipService],
})
export class ShipModule {}
