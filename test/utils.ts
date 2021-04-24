export const testShipResponse = (
  body: any, // actual outcome
  game_id: string,
  type: string,
  is_sunk = false,
) => {
  expect(body).toBeDefined();
  expect(body.game).toBeDefined();
  expect(body.game).toEqual(game_id);
  expect(body.is_sunk).toBeDefined();
  expect(body.is_sunk).toEqual(is_sunk);
  expect(body.type).toBeDefined();
  expect(body.type).toEqual(type);
};
export const testCoordinates = (
  coordinates: any[], // ship coordinates stored in the system
  request: any, // ship placement request or requirement
  size: number, // no. of squares for the ship type
  is_hit: boolean | boolean[] = false, // ship squares might have different hit state
) => {
  expect(coordinates).toBeDefined();
  expect(coordinates.length).toEqual(size); // check for valid ship size as defined
  // for each square of the ship
  [...Array(size).keys()].forEach((i) => {
    expect(coordinates[i]).toBeDefined();
    expect(coordinates[i].x).toBeDefined();
    expect(coordinates[i].y).toBeDefined();
    expect(coordinates[i].is_hit).toBeDefined();
    if (typeof is_hit === 'boolean') {
      expect(coordinates[i].is_hit).toEqual(is_hit); // all square hit or not hit
    } else {
      expect(coordinates[i].is_hit).toEqual(request.is_hit[i]); // squares hit state are different
    }
    expect(coordinates[i].hit_time).toBeDefined();
    if (coordinates[i].is_hit === true) {
      expect(isNaN(Date.parse(coordinates[i].hit_time))).toBeFalsy(); // check valid hit time
    } else {
      expect(coordinates[i].hit_time).toBeNull(); // coordinate not hit
    }
    const x = request.start_x;
    const y = request.start_y;
    // check if ship placed in correct position
    expect(coordinates[i].x).toEqual(request.is_verticle ? x : x + i);
    expect(coordinates[i].y).toEqual(request.is_verticle ? y + i : y);
  });
};
// helper for checking bad request, unauthorized or forbidden exception
export const testBadInput = (
  body: any, // response body by the server
  errMessage: string,
) => {
  expect(body).toBeDefined();
  expect(body.error).toBeDefined();
  expect(body.error.message).toBeDefined();
  expect(body.error.message).toEqual(errMessage); // is the error message as expected
};

export const testAttack = (
  body: any, // actual outcome
  data: any, // expected outcome
  shipType: string,
  moves: number, // total game moves
  misses: number, // total misses
) => {
  expect(body).toBeDefined();
  expect(body.status).toBeDefined(); // check if result of attack sent back
  expect(body.message).toBeDefined();

  if (data.status && data.status === 'miss') {
    expect(body.status).toEqual(data.status);
    expect(body.message).toEqual('it was a miss');
  } else if (data.status && data.status === 'win') {
    expect(body.status).toEqual(data.status);
    expect(body.message).toEqual(
      `you have completed the game in ${moves} moves with ${misses} miss shots`,
    );
  } else {
    if (data.status && data.status === 'hit') {
      expect(body.message).toEqual('it was a hit'); // expected hit message
    } else if (data.status && data.status === 'sink') {
      expect(body.message).toEqual(`you just sank a ${shipType}`); // expected sunk message
    }
  }
};

export const testAttackedCoords = (
  coord_hits: [], // actual attacked corrdinates history
  attacks: any[], // expected attacked corrdinates history
) => {
  expect(coord_hits.length).toEqual(attacks.length);
  for (const i in coord_hits) {
    const { x, y, is_hit, hit_time } = coord_hits[i];
    expect(x).toBeDefined();
    expect(y).toBeDefined();
    expect(x).toEqual(attacks[i].x);
    expect(y).toEqual(attacks[i].y);
    expect(is_hit).toBeTruthy();
    expect(isNaN(Date.parse(hit_time))).toBeFalsy(); // check valid hit time
  }
};
