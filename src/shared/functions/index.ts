import { Coordinate } from '../../schemas';
import { HitCoordinate } from '../interfaces';

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
