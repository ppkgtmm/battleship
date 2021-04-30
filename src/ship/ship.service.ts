import { Injectable } from '@nestjs/common';
import {
  badRequestExceptionThrower,
  BOARD_SIZE,
  getCoordinateIndex,
  ICoordinate,
  ShipBoundary,
  ShipType,
} from '../shared';
import { Model } from 'mongoose';
import { Coordinate, Ship, ShipDocument } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ShipService {
  constructor(
    @InjectModel(Ship.name)
    private readonly shipModel: Model<ShipDocument>,
  ) {}
  async getShipByCoordinate(game_id: string, coordinate: ICoordinate) {
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
    const shipNotSunk = ShipService.shipNotSunk(hitShip.coordinates);
    if (!shipNotSunk) hitShip.is_sunk = true;
    return await hitShip.save();
  }

  private static getShipBoundary(coordinates: Coordinate[]) {
    const start = coordinates[0];
    const end = coordinates.slice(-1)[0];
    return {
      left: start.x === 1 ? start.x : start.x - 1,
      right: end.x === BOARD_SIZE ? end.x : end.x + 1,
      up: start.y === 1 ? start.y : start.y - 1,
      down: end.y === BOARD_SIZE ? end.y : end.y + 1,
    };
  }

  async checkNoShipsAround(game_id: string, boundary: ShipBoundary) {
    const query = {
      game: game_id,
      coordinates: {
        $elemMatch: {
          x: { $gte: boundary.left, $lte: boundary.right },
          y: { $gte: boundary.up, $lte: boundary.down },
        },
      },
    };
    const ships: ShipDocument[] = await this.shipModel.find(query).exec();

    badRequestExceptionThrower(
      ships && ships.length > 0,
      'ships must have least one square between them in all directions',
    );
  }

  async placeShip(
    game_id: string,
    shipType: ShipType,
    shipCoordinates: Coordinate[],
  ) {
    const shipBoundary = ShipService.getShipBoundary(shipCoordinates);
    await this.checkNoShipsAround(game_id, shipBoundary);
    const newShip = new this.shipModel();
    newShip.game = game_id;
    newShip.type = shipType;
    newShip.coordinates = shipCoordinates;
    return await newShip.save();
  }

  async getAllShips(game_id: string, sunkOnly: boolean) {
    const query = { game: game_id };
    if (sunkOnly) query['is_sunk'] = true;
    return await this.shipModel.find(query).exec();
  }
}
