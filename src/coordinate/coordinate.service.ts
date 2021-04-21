import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoordDocument, Coordinate } from '../schemas';
import { Model } from 'mongoose';
import { HitCoordinate } from '../shared';

@Injectable()
export class CoordinateService {
  constructor(
    @InjectModel(Coordinate.name)
    private coordModel: Model<CoordDocument>,
  ) {}

  createCoordObject(hitCoordinate: HitCoordinate, is_hit: boolean) {
    const newCoord = new this.coordModel();
    newCoord.x = hitCoordinate.x;
    newCoord.y = hitCoordinate.y;
    newCoord.is_hit = is_hit;
    if (is_hit) newCoord.hit_time = new Date();
    return newCoord;
  }
}
