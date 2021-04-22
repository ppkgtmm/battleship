import { Coordinate, Ship } from '../../schemas';
import { ICoordinate } from '../interfaces';
import { HitResult } from '../enums';
import { BadRequestException } from '@nestjs/common/exceptions';

export function getCoordinateIndex(
  coordinates: Coordinate[],
  target: ICoordinate,
) {
  for (const index in coordinates) {
    if (coordinates[index].x === target.x && coordinates[index].y === target.y)
      return Number(index);
  }
  return -1;
}

export function getHitResult(hitShip: Ship) {
  if (!hitShip) return HitResult.MISS;
  if (hitShip.is_sunk) return HitResult.SUNK;
  return HitResult.HIT;
}
export function badRequestExceptionThrower(
  condition: boolean,
  message: string,
) {
  if (condition)
    throw new BadRequestException({
      message,
    });
}
