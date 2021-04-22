import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from '../schemas';
import { AuthProvider } from './auth/auth.provider';
import { JwtStrategy } from './auth/jwt/jwt.strategy';
import { GameService } from './game.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    JwtModule.register({
      secret: process.env.PRIVATE_KEY,
      signOptions: { expiresIn: process.env.EXPIRES_IN },
    }),
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
  providers: [GameService, AuthProvider, JwtStrategy],
  exports: [GameService, AuthProvider],
})
export class GameModule {}
