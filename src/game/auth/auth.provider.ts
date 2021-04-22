import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GameService } from '../game.service';
import {
  JWTPayload,
  AuthResponse as Response,
  GamePayload,
  TIME,
  Role,
} from '../../shared';
import { EnterGameDto } from '../../shared';

@Injectable()
export class AuthProvider {
  constructor(
    private jwtService: JwtService,
    private gameService: GameService,
  ) {}

  async create(): Promise<Response> {
    try {
      const { _id, defender_id } = await this.gameService.createGame();
      return {
        game_id: _id,
        token: this.signToken(_id, defender_id, Role.DEFENDER),
      };
    } catch (error) {
      throw error;
    }
  }

  async login({ game_id }: EnterGameDto): Promise<Response> {
    try {
      const { _id, attacker_id } = await this.gameService.enterGame(game_id);
      // console.log('enter game', attacker_id);
      return {
        game_id: _id,
        token: this.signToken(_id, attacker_id, Role.ATTACKER),
      };
    } catch (error) {
      throw error;
    }
  }
  private signToken(gameId: string, id: string, role: Role): string {
    const payload: JWTPayload = {
      game_id: gameId,
      id,
      role,
      iat: Math.floor(Date.now() / 1000),
    };
    return this.jwtService.sign(payload, { expiresIn: TIME });
  }

  async validate(jwtPayload: JWTPayload) {
    const { game_id, id, role } = jwtPayload;
    const query: GamePayload = { _id: game_id };

    if (role == Role.ATTACKER) {
      query.attacker_id = id;
    } else if (role == Role.DEFENDER) {
      query.defender_id = id;
    }
    const game = await this.gameService.findByPayload(query);
    if (game) {
      return {
        ...jwtPayload,
        ...game.toObject(),
      };
    }
    return null;
  }
}
