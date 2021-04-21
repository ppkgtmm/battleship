import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HistoryModule } from './history/history.module';
import { CoordinateModule } from './coordinate/coordinate.module';
import { ShipModule } from './ship/ship.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URL, { useFindAndModify: false }),
    HistoryModule,
    CoordinateModule,
    ShipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
