import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import {
  AttackDto,
  Auth,
  EnterGameDto,
  PlaceShipParam,
  Role,
  ShipDto,
} from './shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('game/new')
  async create() {
    return await this.appService.handleCreateNewGame();
  }

  @Patch('game/enter')
  async login(@Body() body: EnterGameDto) {
    return await this.appService.handleEnterGame(body);
  }

  @Auth(Role.ATTACKER)
  @Patch('attack')
  async handleAttack(@Req() req: any, @Body() body: AttackDto) {
    return await this.appService.handleAttack(req.user, body);
  }

  @Auth(Role.DEFENDER)
  @Post('ship/:ship_type')
  async handlePlaceShip(
    @Req() req: any,
    @Param() params: PlaceShipParam,
    @Body() body: ShipDto,
  ) {
    return await this.appService.handlePlaceShip(
      req.user,
      params.ship_type,
      body,
    );
  }

  @Auth(Role.DEFENDER, Role.ATTACKER)
  @Get('game/history')
  async handleGetStatus(@Req() req: any) {
    return await this.appService.handleGetStatus(req.user);
  }
}
