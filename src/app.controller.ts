import { Body, Controller, Patch } from '@nestjs/common';
import { AppService } from './app.service';
import { AttackDto, Role, Auth } from './shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Auth(Role.ATTACKER)
  @Patch('attack')
  async handleAttack(user: any, @Body() body: AttackDto) {
    return await this.appService.handleAttack(user, body);
  }
}
