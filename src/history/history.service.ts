import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Coordinate, History, HistoryDocument } from '../schemas';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common/exceptions';
import { getCoordinateIndex } from '../shared';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private historyModel: Model<HistoryDocument>,
  ) {}

  private async createNewHistory(hitCoordinate: Coordinate) {
    const newHistory = new this.historyModel();
    newHistory.coord_hit.push(hitCoordinate);
    return await newHistory.save();
  }

  async getBoardHistory(game_id: string, coordinate?: Coordinate) {
    let history = await this.historyModel.findOne({ game: game_id }).exec();
    if (history) return { history, isNew: false };
    if (!coordinate)
      throw new Error('hit coordinate not supplied for creating history');
    history = await this.createNewHistory(coordinate);
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
    const { history, isNew } = await this.getBoardHistory(game_id, coordinate);
    if (isNew) return history;
    if (HistoryService.isShotCoord(history, coordinate))
      throw new BadRequestException({
        message: 'coordinate already hit',
      });
    history.coord_hit.push(coordinate);
    return await history.save();
  }
}
