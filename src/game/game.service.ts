import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../schemas';
import { v4 as uuidv4 } from 'uuid';
import {
  GamePayload as Payload,
  HitResult,
  JWTPayload,
  TOTAL_SHIPS,
} from '../shared';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name)
    private gameModel: Model<GameDocument>,
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

  async findByPayload(payload: Payload): Promise<GameDocument> {
    return await this.gameModel.findOne(payload).exec();
  }

  async updateGameStatus(authData: JWTPayload & Game, attackResult: HitResult) {
    const gameObject = new this.gameModel(authData);
    if (attackResult === HitResult.MISS) gameObject.miss_count += 1;
    else gameObject.hit_count += 1;
    if (attackResult === HitResult.SUNK) gameObject.ship_sunk += 1;
    if (gameObject.ship_sunk === TOTAL_SHIPS) gameObject.game_over = true;
    const { game_over, ship_sunk, hit_count, miss_count } = gameObject.toJSON();
    return await this.gameModel
      .findByIdAndUpdate(authData.id, {
        game_over,
        ship_sunk,
        hit_count,
        miss_count,
      })
      .exec();
  }
  // private async getShipStatus(game_id: any, role: Role) {
  //   const query: any = { game: game_id };
  //   if (role === 'ATTACKER') {
  //     query.is_sunk = true;
  //   }
  //   const ships = await this.shipModel.find(query).exec();
  //   return ships;
  // }

  // async getStatus(authData: TokenBody & Game) {
  //   const { game_id } = authData;
  //   const userRole = authData.role;
  //   if (!Object.values(role).includes(userRole)) {
  //     throw new UnauthorizedException({
  //       message: 'invalid credentials provided',
  //     });
  //   }
  //   const history = await this.getBoardHistory(game_id);
  //   const shipStatus = await this.getShipStatus(game_id, userRole);
  //   return {
  //     attacks: history,
  //     ships: shipStatus,
  //   };
  // }
}
