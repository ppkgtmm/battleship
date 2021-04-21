import { Module } from '@nestjs/common';
import { CoordinateService } from './coordinate.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Coordinate, CoordSchema } from '../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coordinate.name, schema: CoordSchema }]),
  ],
  providers: [CoordinateService],
  exports: [CoordinateService],
})
export class CoordinateModule {}
