import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoordDocument, Coordinate } from '../schemas';
import { Model } from 'mongoose';
import {
  badRequestExceptionThrower,
  BOARD_SIZE,
  ICoordinate,
  ShipDto,
  shipSize,
  ShipType,
} from '../shared';

@Injectable()
export class CoordinateService {
  constructor(
    @InjectModel(Coordinate.name)
    private coordModel: Model<CoordDocument>,
  ) {}

  createCoordObject(hitCoordinate: ICoordinate, is_hit: boolean) {
    const newCoord = new this.coordModel();
    newCoord.x = hitCoordinate.x;
    newCoord.y = hitCoordinate.y;
    newCoord.is_hit = is_hit;
    if (is_hit) newCoord.hit_time = new Date();
    return newCoord;
  }
  createShipCoords(ship: ShipDto, shipType: ShipType): Coordinate[] {
    const coordinates: Coordinate[] = [];
    const { start_x, start_y, is_verticle } = ship;
    const size = shipSize[shipType];
    if (size <= 0) throw new Error('Invalid ship size');
    badRequestExceptionThrower(
      (is_verticle && start_y + size - 1 > BOARD_SIZE) ||
        (!is_verticle && start_x + size - 1 > BOARD_SIZE),
      'ship coordinates cannot be outside board',
    );
    for (const i of Array(size).keys()) {
      const coordinate = new this.coordModel();
      coordinate.x = is_verticle ? start_x : start_x + i;
      coordinate.y = is_verticle ? start_y + i : start_y;
      coordinate.is_hit = false;
      coordinate.hit_time = null;
      coordinates.push(coordinate);
    }
    return coordinates;
  }
}
