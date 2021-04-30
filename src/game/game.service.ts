import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../schemas';
import { v4 as uuidv4 } from 'uuid';
import {
  GamePayload as Payload,
  HitResult,
  JWTPayload,
  ShipType,
  TOTAL_SHIPS,
} from '../shared';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
  ) {}

  async createGame(): Promise<GameDocument> {
    const defenderId = uuidv4();
    const createdGame: GameDocument = new this.gameModel();
    createdGame.defender_id = defenderId;
    return await createdGame.save();
  }

  async enterGame(_id: string): Promise<GameDocument> {
    const game = await this.gameModel.findOne({ _id }).exec();
    if (!game) {
      throw new BadRequestException({ message: 'game not found' });
    }
    if (game && game.attacker_id) {
      throw new BadRequestException({
        message: 'attacker for this game already exist',
      });
    }
    game.attacker_id = uuidv4();
    return await game.save();
  }

  async findByPayload(payload: Payload) {
    return await this.gameModel.findOne(payload).exec();
  }

  async updateGameStatus(
    authData: JWTPayload & GameDocument,
    attackResult: HitResult,
  ) {
    let game_over = authData.game_over;
    let ship_sunk = authData.ship_sunk;
    let hit_count = authData.hit_count;
    let miss_count = authData.miss_count;
    if (attackResult === HitResult.MISS) miss_count += 1;
    else hit_count += 1;
    if (attackResult === HitResult.SUNK) ship_sunk += 1;
    if (ship_sunk === TOTAL_SHIPS) game_over = true;
    return await this.gameModel
      .findByIdAndUpdate(
        authData.game_id,
        { game_over, ship_sunk, hit_count, miss_count },
        { new: true },
      )
      .exec();
  }

  async updateGameShipCount(
    authData: JWTPayload & GameDocument,
    shipType: ShipType,
  ) {
    const query = {
      [shipType]: authData[shipType] + 1,
      total_ships: authData.total_ships + 1,
    };
    return await this.gameModel
      .findByIdAndUpdate(authData.game_id, query, {
        new: true,
      })
      .exec();
  }
}
