import { applyDecorators } from '@nestjs/common';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { BOARD_SIZE } from '../constants';
import { CoordError } from '../interfaces';

export function IsValidCoordinate(err: CoordError) {
  return applyDecorators(
    IsNotEmpty({ message: err.empty }),
    IsInt({ message: err.int }),
    Min(1, { message: err.min }),
    Max(BOARD_SIZE, { message: err.max }),
  );
}
