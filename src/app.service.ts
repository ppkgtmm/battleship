import { Injectable } from '@nestjs/common';
import { HistoryService } from './history/history.service';
import {
  AttackDto,
  badRequestExceptionThrower,
  EnterGameDto,
  getHitResult,
  HitResult,
  JWTPayload,
  maxShips,
  Role,
  ShipDto,
  ShipType,
  TOTAL_SHIPS,
} from './shared';
import { Game, GameDocument } from './schemas';
import { CoordinateService } from './coordinate/coordinate.service';
import { ShipService } from './ship/ship.service';
import { GameService } from './game/game.service';
import { AuthProvider } from './game/auth/auth.provider';

@Injectable()
export class AppService {
  constructor(
    private historyService: HistoryService,
    private coordinateService: CoordinateService,
    private shipService: ShipService,
    private gameService: GameService,
    private authProvider: AuthProvider,
  ) {}

  private static getAttackResponse(
    hitResult: HitResult,
    shipType: ShipType | undefined,
  ) {
    if (hitResult !== HitResult.SUNK)
      return {
        status: hitResult,
        message: `it was a ${hitResult}`,
      };
    if (!shipType) throw new Error('ship type not provided for sunk ship');
    return {
      status: hitResult,
      message: `you just sank a ${shipType}`,
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

  async handleGetStatus(authData: GameDocument & JWTPayload) {
    const { game_id } = authData;
    const history = await this.historyService.getBoardHistory(game_id);
    const shipStatus = await this.shipService.getAllShips(
      game_id,
      authData.role == Role.ATTACKER,
    );
    return {
      attacks: history,
      ships: shipStatus,
    };
  }

  async handleCreateNewGame() {
    return await this.authProvider.create();
  }

  async handleEnterGame(data: EnterGameDto) {
    return await this.authProvider.login(data);
  }
}
