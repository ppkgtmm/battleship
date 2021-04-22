import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AttackDto, Role, Auth, ShipDto, PlaceShipParam } from './shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Auth(Role.ATTACKER)
  @Patch('attack')
  async handleAttack(user: any, @Body() body: AttackDto) {
    return await this.appService.handleAttack(user, body);
  }

  @Auth(Role.DEFENDER)
  @Post('ship/:ship_type')
  async handlePlaceShip(
    user: any,
    @Param() params: PlaceShipParam,
    @Body() body: ShipDto,
  ) {
    return await this.appService.handlePlaceShip(user, params.ship_type, body);
  }
}
