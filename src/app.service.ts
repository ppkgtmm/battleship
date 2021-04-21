import { Injectable } from '@nestjs/common';
import { HistoryService } from './history/history.service';
import {
  AttackDto,
  HitResult,
  JWTPayload,
  ShipType,
  TOTAL_SHIPS,
} from './shared';
import { Game, ShipDocument } from './schemas';
import { BadRequestException } from '@nestjs/common/exceptions';
import { CoordinateService } from './coordinate/coordinate.service';
import { ShipService } from './ship/ship.service';

@Injectable()
export class AppService {
  constructor(
    private historyService: HistoryService,
    private coordinateService: CoordinateService,
    private shipService: ShipService,
  ) {}

  private static getAttackResponse(hitShip: ShipDocument) {
    if (!hitShip)
      return { status: HitResult.MISS, message: `It was a ${HitResult.MISS}` };
    if (!hitShip.is_sunk)
      return { status: HitResult.HIT, message: `It was a ${HitResult.HIT}` };
    return {
      status: HitResult.SUNK,
      message: `You just sank a ${hitShip.type}`,
    };
  }

  async handleAttack(authData: JWTPayload & Game, attackData: AttackDto) {
    if (authData.total_ships !== TOTAL_SHIPS) {
      throw new BadRequestException({
        message: 'defender has not placed all ships yet',
      });
    }
    if (authData.game_over)
      throw new BadRequestException({
        message: 'all ships have been sunk already',
      });
    const coordinate = this.coordinateService.createCoordObject(
      attackData,
      true,
    );
    await this.historyService.recordAttack(authData.game_id, coordinate);
    const hitShip = await this.shipService.markHitShipCoordinate(
      authData.game_id,
      coordinate,
    );
    return AppService.getAttackResponse(hitShip);
  }
}
