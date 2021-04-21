import { IsValidCoordinate } from '../decorators';
import { coordError } from '../constants';

const { x, y } = coordError;

export class AttackDto {
  @IsValidCoordinate(x)
  x: number;

  @IsValidCoordinate(y)
  y: number;
}
