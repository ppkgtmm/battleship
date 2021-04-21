import { IsMongoId, IsNotEmpty } from 'class-validator';

export class EnterGameDto {
  @IsMongoId({ message: 'game ID is invalid' })
  @IsNotEmpty({ message: 'game ID is required' })
  game_id: string;
}
