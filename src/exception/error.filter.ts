import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    console.log(error.stack);
    const response: Response = host.switchToHttp().getResponse();
    const status: number =
      error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message: any =
      error instanceof HttpException
        ? error.getResponse()
        : 'some error ocurred';
    if (typeof message == 'object') {
      return response.status(status).json({
        error: {
          ...message,
        },
      });
    }
    return {
      error: {
        message,
      },
    };
  }
}
