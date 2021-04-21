import { BadRequestException } from '@nestjs/common/exceptions';
import { ValidationError } from 'class-validator';

export function exceptionFactory(errors: ValidationError[]) {
  const errorMessages = {};
  errors.forEach((error) => {
    errorMessages[error.property] = Object.values(error.constraints);
  });
  throw new BadRequestException(errorMessages);
}
