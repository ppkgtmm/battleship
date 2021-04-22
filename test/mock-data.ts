import {
  ShipType,
  BATTLESHIP_SIZE,
  CRUISER_SIZE,
  DESTROYER_SIZE,
  SUBMARINE_SIZE,
} from '../src/shared';
const BATTLE_SHIP = ShipType.BATTLESHIP;
const CRUISER = ShipType.CRUISER;
const DESTROYER = ShipType.DESTROYER;
const SUBMARINE = ShipType.SUBMARINE;
// a map of ship types to help in testing
export const map = {
  BATTLE_SHIP: {
    url: '/api/ship/battleship/', // api endpoint
    type: BATTLE_SHIP,
    size: BATTLESHIP_SIZE,
  },
  CRUISER: {
    url: '/api/ship/cruiser/',
    type: CRUISER,
    size: CRUISER_SIZE,
  },
  DESTROYER: {
    url: '/api/ship/destroyer/',
    type: DESTROYER,
    size: DESTROYER_SIZE,
  },
  SUBMARINE: {
    url: '/api/ship/submarine/',
    type: SUBMARINE,
    size: SUBMARINE_SIZE,
  },
};

// ship placement data is divided into 2 parts to help testing

// ship placement data part 1
export const mockData1 = [
  {
    key: 'BATTLE_SHIP', // key in the map above
    start_x: 1, // top most coordinate x value
    start_y: 3, // top most coordinate y value
    is_verticle: true, // vertically aligned ship
  },
  {
    key: 'CRUISER',
    start_x: 4,
    start_y: 1,
    is_verticle: true,
  },
  {
    key: 'DESTROYER',
    start_x: 1, // left most coordinate x value
    start_y: 8, // left most coordinate y value
    is_verticle: false, // horizontally aligned ship
  },
  {
    key: 'DESTROYER',
    start_x: 6,
    start_y: 6,
    is_verticle: true,
  },
  {
    key: 'SUBMARINE',
    start_x: 7,
    start_y: 1,
    is_verticle: false,
  },
  {
    key: 'SUBMARINE',
    start_x: 10,
    start_y: 3,
    is_verticle: true,
  },
  {
    key: 'SUBMARINE',
    start_x: 8,
    start_y: 6,
    is_verticle: true,
  },
];

// ship placement data part 2
export const mockData2 = [
  {
    key: 'CRUISER',
    start_x: 6,
    start_y: 3,
    is_verticle: false,
  },
  {
    key: 'DESTROYER',
    start_x: 1,
    start_y: 1,
    is_verticle: false,
  },
  {
    key: 'SUBMARINE',
    start_x: 5,
    start_y: 10,
    is_verticle: false,
  },
];

// extra ship placement data for validation
export const extraData = [
  {
    key: 'SUBMARINE',
    start_x: 1,
    start_y: 8,
    is_verticle: true,
  },
  {
    key: 'DESTROYER',
    start_x: 5,
    start_y: 5,
    is_verticle: true,
  },
  {
    key: 'CRUISER',
    start_x: 5,
    start_y: 5,
    is_verticle: true,
  },
  {
    key: 'SUBMARINE',
    start_x: 5,
    start_y: 5,
    is_verticle: true,
  },
];

// data that violate game rule which is ships should not overlap
// and be at least one square far in all directions
export const incorrectData = [
  {
    key: 'DESTROYER', // direct above
    start_x: 6,
    start_y: 4,
    is_verticle: true,
  },
  {
    key: 'CRUISER', // adjacent left
    start_x: 7,
    start_y: 3,
    is_verticle: false,
  },
  {
    key: 'SUBMARINE', // adjacent right, diagonal bottom left
    start_x: 3,
    start_y: 8,
    is_verticle: false,
  },
  {
    key: 'DESTROYER', // diagonal top right
    start_x: 3,
    start_y: 6,
    is_verticle: true,
  },
  {
    key: 'DESTROYER',
    start_x: 3,
    start_y: 4,
    is_verticle: true,
  },
  {
    key: 'DESTROYER', // cross over horizontally
    start_x: 2,
    start_y: 8,
    is_verticle: false,
  },
  {
    key: 'DESTROYER', // direct under
    start_x: 1,
    start_y: 9,
    is_verticle: true,
  },
  {
    key: 'SUBMARINE', // cross over vertically
    start_x: 10,
    start_y: 1,
    is_verticle: true,
  },
  {
    key: 'CRUISER', // over lapping
    start_x: 10,
    start_y: 3,
    is_verticle: true,
  },
];

// data to place ships that might make ship go out of board
export const outOfBoard = [
  {
    key: 'CRUISER',
    start_x: 10,
    start_y: 7,
    is_verticle: false,
  },
  {
    key: 'DESTROYER',
    start_x: 10,
    start_y: 10,
    is_verticle: true,
  },
];

// attack data is separated into 2 parts for testing purpose

// first part of attack data
export const firstHalfAttack = [
  {
    status: 'miss', // help to know expected reponse message
    x: 1,
    y: 2,
  },
  {
    status: 'hit',
    key: 'BATTLE_SHIP', // key in the map above
    x: 1,
    y: 4,
  },
  {
    status: 'hit',
    key: 'BATTLE_SHIP',
    x: 1,
    y: 3,
  },
  {
    status: 'hit',
    key: 'BATTLE_SHIP',
    x: 1,
    y: 6,
  },
  {
    status: 'miss',
    x: 6,
    y: 1,
  },
  {
    status: 'sink',
    key: 'BATTLE_SHIP',
    x: 1,
    y: 5,
  },
  {
    status: 'hit',
    key: 'CRUISER',
    x: 4,
    y: 3,
  },
  {
    status: 'hit',
    key: 'CRUISER',
    x: 4,
    y: 1,
  },
  {
    status: 'sink',
    key: 'CRUISER',
    x: 4,
    y: 2,
  },
  {
    status: 'hit',
    key: 'CRUISER',
    x: 7,
    y: 3,
  },
  {
    status: 'miss',
    x: 9,
    y: 4,
  },
  {
    status: 'hit',
    key: 'CRUISER',
    x: 8,
    y: 3,
  },
  {
    status: 'hit',
    key: 'DESTROYER',
    x: 6,
    y: 6,
  },
  {
    status: 'sink',
    key: 'DESTROYER',
    x: 6,
    y: 7,
  },
  {
    status: 'miss',
    x: 1,
    y: 9,
  },
  {
    status: 'hit',
    key: 'SUBMARINE',
    x: 10,
    y: 5,
  },
  {
    status: 'hit',
    key: 'SUBMARINE',
    x: 6,
    y: 10,
  },
  {
    status: 'miss',
    x: 4,
    y: 10,
  },
  {
    status: 'hit',
    key: 'SUBMARINE',
    x: 7,
    y: 10,
  },
  {
    status: 'sink',
    key: 'SUBMARINE',
    x: 5,
    y: 10,
  },
];

export const miss_count = 5;
export const hit_count = 15;
export const ship_sunk = 4;

// second part of attack data
export const secondHalfAttack = [
  {
    status: 'sink',
    key: 'CRUISER',
    x: 6,
    y: 3,
  },
  {
    status: 'miss',
    x: 3,
    y: 5,
  },
  {
    status: 'hit',
    key: 'DESTROYER',
    x: 1,
    y: 1,
  },
  {
    status: 'hit',
    key: 'DESTROYER',
    x: 1,
    y: 8,
  },
  {
    status: 'miss',
    x: 7,
    y: 6,
  },
  {
    status: 'sink',
    key: 'DESTROYER',
    x: 2,
    y: 8,
  },
  {
    status: 'miss',
    x: 10,
    y: 10,
  },
  {
    status: 'hit',
    key: 'SUBMARINE',
    x: 8,
    y: 1,
  },
  {
    status: 'hit',
    key: 'SUBMARINE',
    x: 9,
    y: 1,
  },
  {
    status: 'sink',
    key: 'SUBMARINE',
    x: 7,
    y: 1,
  },
  {
    status: 'hit',
    key: 'SUBMARINE',
    x: 10,
    y: 3,
  },
  {
    status: 'sink',
    key: 'SUBMARINE',
    x: 10,
    y: 4,
  },
  {
    status: 'hit',
    key: 'SUBMARINE',
    x: 8,
    y: 6,
  },
  {
    status: 'hit',
    key: 'SUBMARINE',
    x: 8,
    y: 7,
  },
  {
    status: 'sink',
    key: 'SUBMARINE',
    x: 8,
    y: 8,
  },

  {
    status: 'win',
    key: 'DESTROYER',
    x: 2,
    y: 1,
  },
];

// expected ship status for defender at a point in middle of the game
export const shipStatusDefender = [
  {
    key: 'BATTLE_SHIP', // key in the map above
    start_x: 1, // topmost x coordinate value
    start_y: 3, // topmost y coordinate value
    is_verticle: true, // vertical ship
    is_sunk: true,
    is_hit: [true, true, true, true], // a list in case some coordinates are not hit
  },
  {
    key: 'CRUISER',
    start_x: 4,
    start_y: 1,
    is_verticle: true,
    is_sunk: true,
    is_hit: [true, true, true],
  },
  {
    key: 'DESTROYER',
    start_x: 1, // leftmost x coordinate value
    start_y: 8, // leftmost y coordinate value
    is_verticle: false, // horizontal ship
    is_sunk: false,
    is_hit: [false, false],
  },
  {
    key: 'DESTROYER',
    start_x: 6,
    start_y: 6,
    is_verticle: true,
    is_sunk: true,
    is_hit: [true, true],
  },
  {
    key: 'SUBMARINE',
    start_x: 7,
    start_y: 1,
    is_verticle: false,
    is_sunk: false,
    is_hit: [false, false, false],
  },
  {
    key: 'SUBMARINE',
    start_x: 10,
    start_y: 3,
    is_verticle: true,
    is_sunk: false,
    is_hit: [false, false, true],
  },
  {
    key: 'SUBMARINE',
    start_x: 8,
    start_y: 6,
    is_verticle: true,
    is_sunk: false,
    is_hit: [false, false, false],
  },
  {
    key: 'CRUISER',
    start_x: 6,
    start_y: 3,
    is_verticle: false,
    is_sunk: false,
    is_hit: [false, true, true],
  },
  {
    key: 'DESTROYER',
    start_x: 1,
    start_y: 1,
    is_verticle: false,
    is_sunk: false,
    is_hit: [false, false],
  },
  {
    key: 'SUBMARINE',
    start_x: 5,
    start_y: 10,
    is_verticle: false,
    is_sunk: true,
    is_hit: [true, true, true],
  },
];

// expected sunk ship status for attacker at a point in middle of the game
export const shipStatusAttacker = [
  {
    key: 'BATTLE_SHIP',
    start_x: 1,
    start_y: 3,
    is_verticle: true,
    is_sunk: true,
  },
  {
    key: 'CRUISER',
    start_x: 4,
    start_y: 1,
    is_verticle: true,
    is_sunk: true,
  },
  {
    key: 'DESTROYER',
    start_x: 6,
    start_y: 6,
    is_verticle: true,
    is_sunk: true,
  },
  {
    key: 'SUBMARINE',
    start_x: 5,
    start_y: 10,
    is_verticle: false,
    is_sunk: true,
  },
];

// coordinates that are already attacked
export const duplicateCoord = [
  {
    x: 1,
    y: 2,
  },
  {
    x: 4,
    y: 1,
  },
  {
    x: 6,
    y: 7,
  },
  {
    x: 5,
    y: 10,
  },
  {
    x: 6,
    y: 1,
  },
];

// invalid sample request body for attack endpoint

// no y coordinate
export const invalidAttack = {
  x: 11.0,
  z: 8,
};

// string for x, decimal y
export const invalidAttack2 = {
  x: '0',
  y: 8.9,
};

// many x, negative y
export const invalidAttack3 = {
  x: [11, 2],
  y: -1,
};

// total moves (hits + misses) not counting duplicate moves
export const moves = 36;
export const misses = 8; // total misses
