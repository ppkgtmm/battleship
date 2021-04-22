import { IsBoolean, IsNotEmpty } from 'class-validator';
import { IsValidCoordinate } from '../decorators';
import { coordError, isVerticleError } from '../constants';

const { x, y } = coordError;

export class ShipDto {
  @IsValidCoordinate(x)
  start_x: number;

  @IsValidCoordinate(y)
  start_y: number;

  @IsBoolean({ message: isVerticleError.bool })
  @IsNotEmpty({ message: isVerticleError.empty })
  is_verticle: boolean;
}
