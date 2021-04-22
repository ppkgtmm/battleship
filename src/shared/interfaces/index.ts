import { Role } from '../enums';

export interface JWTPayload {
  game_id: string;
  id: string;
  role: Role;
  iat: number;
  exp?: number;
}

export interface AuthResponse {
  game_id: string;
  token: string;
}

export interface GamePayload {
  _id: string;

  defender_id?: string;

  attacker_id?: string;
}

export interface ICoordinate {
  x: number;
  y: number;
}

export interface CoordError {
  empty: string;
  int: string;
  min: string;
  max: string;
}

export interface ShipBoundary {
  up: number;
  down: number;
  left: number;
  right: number;
}
