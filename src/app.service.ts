import { Injectable } from '@nestjs/common';
import { HistoryService } from './history/history.service';
import {
  AttackDto,
  getHitResult,
  HitResult,
  JWTPayload,
  ShipType,
  TOTAL_SHIPS,
} from './shared';
import { Game } from './schemas';
import { BadRequestException } from '@nestjs/common/exceptions';
import { CoordinateService } from './coordinate/coordinate.service';
import { ShipService } from './ship/ship.service';
import { GameService } from './game/game.service';

@Injectable()
export class AppService {
  constructor(
    private historyService: HistoryService,
    private coordinateService: CoordinateService,
    private shipService: ShipService,
    private gameService: GameService,
  ) {}

  private static getAttackResponse(hitResult: HitResult, shipType: ShipType) {
    if (!shipType || hitResult !== HitResult.SUNK)
      return {
        status: hitResult,
        message: `It was a ${hitResult}`,
      };
    return {
      status: hitResult,
      message: `You just sank a ${shipType}`,
    };
  }

  async handleAttack(authData: JWTPayload & Game, attackData: AttackDto) {
    if (authData.game_over)
      throw new BadRequestException({
        message: 'all ships have been sunk already',
      });
    if (authData.total_ships !== TOTAL_SHIPS) {
      throw new BadRequestException({
        message: 'defender has not placed all ships yet',
      });
    }
    const coordinate = this.coordinateService.createCoordObject(
      attackData,
      true,
    );
    await this.historyService.recordAttack(authData.game_id, coordinate);
    const hitShip = await this.shipService.markHitShipCoordinate(
      authData.game_id,
      coordinate,
    );
    const hitResult = getHitResult(hitShip);
    await this.gameService.updateGameStatus(authData, hitResult);
    return AppService.getAttackResponse(hitResult, hitShip?.type);
  }
}
