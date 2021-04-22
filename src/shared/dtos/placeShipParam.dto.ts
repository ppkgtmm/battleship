import { IsEnum, IsNotEmpty } from 'class-validator';
import { ShipType } from '../enums';
const shipTypes = Object.values(ShipType).join(', ');

export class PlaceShipParam {
  @IsEnum(ShipType, {
    message: `ship type should be one of ${shipTypes}`,
  })
  @IsNotEmpty({ message: 'ship type is required' })
  ship_type: ShipType;
}
