import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Coordinate, History, HistoryDocument } from '../schemas';
import { Model } from 'mongoose';
import { badRequestExceptionThrower, getCoordinateIndex } from '../shared';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private readonly historyModel: Model<HistoryDocument>,
  ) {}

  private async createNewHistory(game_id: string, hitCoordinate: Coordinate) {
    const newHistory = new this.historyModel();
    newHistory.game = game_id;
    newHistory.coord_hit.push(hitCoordinate);
    return await newHistory.save();
  }

  async getBoardHistory(game_id: string) {
    return await this.historyModel.findOne({ game: game_id }).exec();
  }

  async getOrCreateBoardHistory(game_id: string, coordinate: Coordinate) {
    let history = await this.getBoardHistory(game_id);
    if (history) return { history, isNew: false };
    history = await this.createNewHistory(game_id, coordinate);
    return { history, isNew: true };
  }

  private static isShotCoord(
    history: HistoryDocument,
    target: Coordinate,
  ): boolean {
    if (!history) return false;
    const coordinates: Coordinate[] = history.coord_hit;
    return getCoordinateIndex(coordinates, target) >= 0;
  }

  async recordAttack(game_id: string, coordinate: Coordinate) {
    const { history, isNew } = await this.getOrCreateBoardHistory(
      game_id,
      coordinate,
    );
    if (isNew) return history;
    badRequestExceptionThrower(
      HistoryService.isShotCoord(history, coordinate),
      'coordinate already hit',
    );
    history.coord_hit.push(coordinate);
    return await history.save();
  }
}
