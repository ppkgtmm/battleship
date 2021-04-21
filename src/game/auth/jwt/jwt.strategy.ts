import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthProvider } from '../auth.provider';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authProvider: AuthProvider) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY,
    });
  }

  async validate(payload: any, done: VerifiedCallback) {
    const game = await this.authProvider.validate(payload);
    if (!game) {
      throw new UnauthorizedException({
        message: 'invalid credentials provided',
      });
    }
    return done(null, game);
  }
}
