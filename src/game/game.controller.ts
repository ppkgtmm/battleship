// import {
//   Body,
//   Controller,
//   Get,
//   Post,
//   Put,
//   Req,
//   UseGuards,
// } from '@nestjs/common';
// import { AuthProvider } from './auth/auth.provider';
// import { EnterGameDto } from '../../shared/dtos/enterGame.dto';
// import { Response } from '../../shared/interfaces/response';
// import { JwtAuthGuard } from '../shared/guards';
// import { GameService } from './game.service';
//
// @Controller('game')
// export class GameController {
//   constructor(
//     private readonly authProvider: AuthProvider,
//     private readonly gameService: GameService,
//   ) {}
//
//   @Post('new')
//   async create(): Promise<Response> {
//     const response = await this.authProvider.create();
//     return response;
//   }
//
//   @Put('enter')
//   async login(@Body() body: EnterGameDto): Promise<Response> {
//     const response = await this.authProvider.login(body);
//     return response;
//   }
//
//   @UseGuards(JwtAuthGuard)
//   @Get('status')
//   async getStatus(@Req() req: any) {
//     const status = await this.gameService.getStatus(req.user);
//     return status;
//   }
// }
