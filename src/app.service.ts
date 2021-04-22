import { Injectable } from '@nestjs/common';
import { HistoryService } from './history/history.service';
import {
  AttackDto,
  badRequestExceptionThrower,
  getHitResult,
  HitResult,
  JWTPayload,
  maxShips,
  ShipDto,
  ShipType,
  TOTAL_SHIPS,
} from './shared';
import { Game, GameDocument } from './schemas';
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
    if (hitResult !== HitResult.SUNK)
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
    badRequestExceptionThrower(
      authData.game_over,
      'all ships have been sunk already',
    );
    badRequestExceptionThrower(
      authData.total_ships !== TOTAL_SHIPS,
      'defender has not placed all ships yet',
    );
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

  async handlePlaceShip(
    authData: GameDocument & JWTPayload,
    shipType: ShipType,
    data: ShipDto,
  ) {
    badRequestExceptionThrower(
      authData[shipType] == maxShips[shipType],
      `maximum amount of ${shipType} reached`,
    );
    const shipCoordinates = this.coordinateService.createShipCoords(
      data,
      shipType,
    );
    const newShip = await this.shipService.placeShip(
      authData.game_id,
      shipType,
      shipCoordinates,
    );
    await this.gameService.updateGameShipCount(authData, shipType);
    return newShip;
  }
}
