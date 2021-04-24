export const BOARD_SIZE = 10;
export const TOTAL_SHIPS = 10;

export const NUM_BATTLESHIP = 1;
export const NUM_CRUISER = 2;
export const NUM_DESTROYER = 3;
export const NUM_SUBMARINE = 4;

export const BATTLESHIP_SIZE = 4;
export const CRUISER_SIZE = 3;
export const DESTROYER_SIZE = 2;
export const SUBMARINE_SIZE = 3;

export const TIME = 3600;

export const shipSize = {
  battleship: BATTLESHIP_SIZE,
  cruiser: CRUISER_SIZE,
  destroyer: DESTROYER_SIZE,
  submarine: SUBMARINE_SIZE,
};

export const numShips = {
  battleship: NUM_BATTLESHIP,
  cruiser: NUM_CRUISER,
  destroyer: NUM_DESTROYER,
  submarine: NUM_SUBMARINE,
};

export const coordError = {
  x: {
    empty: 'x of coordinate is required',
    int: 'x of coordinate must be an integer',
    min: 'x of coordinate should be at least 1',
    max: `x of coordinate should be at most ${BOARD_SIZE}`,
  },
  y: {
    empty: 'y of coordinate is required',
    int: 'y of coordinate must be an integer',
    min: 'y of coordinate should be at least 1',
    max: `y of coordinate should be at most ${BOARD_SIZE}`,
  },
};

export const isVerticleError = {
  empty: 'alignment of ship is required',
  bool: 'is_verticle should either be true or false',
};
