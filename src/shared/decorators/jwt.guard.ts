import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err) {
      throw err;
    } else if (!user) {
      throw new UnauthorizedException({
        message: 'invalid credentials provided',
      });
    }
    return user;
  }
}
