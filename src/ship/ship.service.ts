import { Injectable } from '@nestjs/common';
import { getCoordinateIndex, HitCoordinate, HitResult } from '../shared';
import { Model } from 'mongoose';
import { Coordinate, Ship, ShipDocument } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ShipService {
  constructor(
    @InjectModel(Ship.name)
    private shipModel: Model<ShipDocument>,
  ) {}
  async getShipByCoordinate(game_id: string, coordinate: HitCoordinate) {
    const { x, y } = coordinate;
    return await this.shipModel
      .findOne({
        game: game_id,
        coordinates: { $elemMatch: { x, y } },
      })
      .exec();
  }
  private static shipNotSunk(coordinates: Coordinate[]) {
    for (const coordinate of coordinates) {
      if (!coordinate.is_hit) return true;
    }
    return false;
  }
  async markHitShipCoordinate(game_id: string, coordinate: Coordinate) {
    const hitShip = await this.getShipByCoordinate(game_id, coordinate);
    if (!hitShip) return hitShip;
    const targetCoordIndex = getCoordinateIndex(
      hitShip.coordinates,
      coordinate,
    );
    if (targetCoordIndex >= 0) {
      hitShip.coordinates[targetCoordIndex] = coordinate;
    }
    const shipNotSUnk = ShipService.shipNotSunk(hitShip.coordinates);
    if (!shipNotSUnk) hitShip.is_sunk = true;
    return await hitShip.save();
  }
}
