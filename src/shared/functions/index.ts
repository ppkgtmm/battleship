import { Coordinate, Ship } from '../../schemas';
import { HitCoordinate } from '../interfaces';
import { HitResult } from '../enums';

export function getCoordinateIndex(
  coordinates: Coordinate[],
  target: HitCoordinate,
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
