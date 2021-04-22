import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';
import { ErrorFilter, exceptionFactory } from '../src/exception';
import {
  testBadInput,
  testCoordinates,
  testShipResponse,
  testAttack,
  testAttackedCoords,
} from './utils';
import {
  attackUrl,
  coordAsArray,
  emptyShipTypeUrl,
  enterGameUrl,
  fakeToken,
  fakeValidId,
  fakeValidToken,
  getStatusUrl,
  invalidBody,
  invalidPlaceShipUrl,
  newGameUrl,
  placeBattleshipUrl,
  validBody,
} from './constants';
import { coordError, TOTAL_SHIPS, isVerticleError } from '../src/shared';
import {
  map,
  mockData1,
  mockData2,
  incorrectData,
  outOfBoard,
  extraData,
  invalidAttack,
  invalidAttack2,
  invalidAttack3,
  firstHalfAttack,
  secondHalfAttack,
  moves,
  misses,
  duplicateCoord,
  shipStatusDefender,
  shipStatusAttacker,
  miss_count,
  hit_count,
  ship_sunk,
} from './mock-data';

describe('App (e2e)', () => {
  let app: INestApplication;
  let game_id: string;
  let token: string;
  let attackerToken: string;
  const { x, y } = coordError; // request's coordinate validation error
  const { bool, empty } = isVerticleError; // request's ship alignment (is_verticle) error

  // initialize app
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory,
      }),
    );
    app.useGlobalFilters(new ErrorFilter());
    await app.init();
  });

  it('should create new game session', () => {
    return request(app.getHttpServer())
      .post(newGameUrl)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.game_id).toBeDefined();
        expect(body.token).toBeDefined();
        expect(body.defender_id).toBeUndefined();
        game_id = body.game_id;
        token = body.token;
      });
  });

  // validation error
  it('should demand game id', () => {
    return request(app.getHttpServer())
      .patch(enterGameUrl)
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();
        expect(body.error.game_id).toBeDefined();

        // no game id, game id has invalid format
        expect(body.error.game_id).toHaveLength(2);
      });
  });

  // validation error
  it('should not accept invalid game id', () => {
    return request(app.getHttpServer())
      .patch(enterGameUrl)
      .send({
        game_id: '123',
        user_id: 456, // should ignore
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();
        expect(body.error.game_id).toBeDefined();
        expect(body.error.game_id).toHaveLength(1); // game id has invalid format
        expect(body.error.user_id).toBeUndefined();
      });
  });

  // correct format but unknown game id
  it('should not accept unexisting game id', () => {
    return request(app.getHttpServer())
      .patch(enterGameUrl)
      .send({ game_id: Types.ObjectId().toHexString() })
      .expect(400)
      .expect(({ body }) => {
        testBadInput(body, 'game not found');
      });
  });

  it('should accept attacker', () => {
    return request(app.getHttpServer())
      .patch(enterGameUrl)
      .send({
        game_id,
        user_id: 789, // should ignore
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.game_id).toBeDefined();
        expect(body.game_id).toEqual(game_id);
        expect(body.token).toBeDefined();
        expect(body.attacker_id).toBeUndefined();
        expect(body.user_id).toBeUndefined();

        attackerToken = body.token;
      });
  });

  // game has 2 players: defender and attacker
  it('should not accept more attacker', () => {
    return request(app.getHttpServer())
      .patch(enterGameUrl)
      .send({ game_id })
      .expect(400)
      .expect(({ body }) => {
        testBadInput(body, 'attacker for this game already exist');
      });
  });

  // attacker have to wait for all ships to be placed
  it('should not allow attacks until all set', () => {
    return request(app.getHttpServer())
      .patch(attackUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .send({ x: 1, y: 1 })
      .expect(400)
      .expect(({ body }) => {
        testBadInput(body, 'defender has not placed all ships yet');
      });
  });

  // only defender can place ship with token
  it('should demand token to place ship', () => {
    return request(app.getHttpServer())
      .post(placeBattleshipUrl)
      .expect(401)
      .expect(({ body }) => {
        testBadInput(body, 'invalid credentials provided');
      });
  });

  // should not allow token generated by others
  it('should deny fake token', () => {
    return request(app.getHttpServer())
      .post(invalidPlaceShipUrl)
      .set('Authorization', 'bearer ' + fakeToken)
      .expect(401)
      .expect(({ body }) => {
        testBadInput(body, 'invalid credentials provided');
      });
  });

  // only defender can place ship
  it('should not allow attacker place ship', () => {
    return request(app.getHttpServer())
      .post(placeBattleshipUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .expect(403)
      .expect(({ body }) => {
        testBadInput(body, 'not permitted for the action');
      });
  });

  // should not accept credentials(though generated by the server) for unexisting game
  it('should deny unexisting game', () => {
    return request(app.getHttpServer())
      .post(placeBattleshipUrl)
      .set('Authorization', 'bearer ' + fakeValidToken)
      .send({
        game_id: fakeValidId,
        ...validBody,
      })
      .expect(401)
      .expect(({ body }) => {
        testBadInput(body, 'invalid credentials provided');
      });
  });

  // should not allow to place invalid ship type
  it('should deny empty ship type', () => {
    return request(app.getHttpServer())
      .post(emptyShipTypeUrl)
      .set('Authorization', 'bearer ' + token)
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();

        expect(body.error.ship_type).toBeUndefined();
        expect(body.error.ship_type).toHaveLength(2);
      });
  });

  // should not allow to place invalid ship type
  it('should deny invalid ship type', () => {
    return request(app.getHttpServer())
      .post(invalidPlaceShipUrl)
      .set('Authorization', 'bearer ' + token)
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();

        expect(body.error.ship_type).toBeUndefined();
        expect(body.error.ship_type).toHaveLength(1);
      });
  });

  // validation error (empty request body)
  it('should not allow empty request body', () => {
    return request(app.getHttpServer())
      .post(placeBattleshipUrl)
      .set('Authorization', 'bearer ' + token)
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();

        expect(body.error.type).toBeUndefined();
        expect(body.error.game_id).toBeUndefined();

        expect(body.error.start_x).toBeDefined();
        expect(body.error.start_x).toHaveLength(4);
        expect(body.error.start_x).toEqual([x.empty, x.int, x.min, x.max]);

        expect(body.error.start_y).toBeDefined();
        expect(body.error.start_y).toHaveLength(4);
        expect(body.error.start_y).toEqual([y.empty, y.int, y.min, y.max]);

        expect(body.error.is_verticle).toBeDefined();
        expect(body.error.is_verticle).toHaveLength(2);
        expect(body.error.is_verticle).toEqual([empty, bool]);
      });
  });

  // validation error
  it('should not allow invalid request body', () => {
    return request(app.getHttpServer())
      .post(placeBattleshipUrl)
      .set('Authorization', 'bearer ' + token)
      .send({ ...invalidBody, game_id })
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();

        expect(body.error.type).toBeUndefined();
        expect(body.error.game_id).toBeUndefined(); // should ignore game id passed with request
        expect(body.error.end_x).toBeUndefined(); // should ignore unknown properties

        expect(body.error.start_x).toBeDefined();
        expect(body.error.start_x).toHaveLength(1);
        expect(body.error.start_x).toEqual([x.max]);

        expect(body.error.start_y).toBeDefined();
        expect(body.error.start_y).toHaveLength(2);
        expect(body.error.start_y).toEqual([y.int, y.min]);

        expect(body.error.is_verticle).toBeDefined();
        expect(body.error.is_verticle).toHaveLength(1);
        expect(body.error.is_verticle).toEqual([bool]);
      });
  });

  // validation error
  it('should not allow more than one start coordinate', () => {
    return request(app.getHttpServer())
      .post(placeBattleshipUrl)
      .set('Authorization', 'bearer ' + token)
      .send({ ...coordAsArray, game_id })
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();

        expect(body.error.type).toBeUndefined();
        expect(body.error.game_id).toBeUndefined();
        expect(body.error.end_x).toBeUndefined();

        expect(body.error.start_x).toBeDefined();
        expect(body.error.start_x).toHaveLength(3);
        expect(body.error.start_x).toEqual([x.int, x.min, x.max]);

        expect(body.error.start_y).toBeDefined();
        expect(body.error.start_y).toHaveLength(3);
        expect(body.error.start_y).toEqual([y.int, y.min, y.max]);
      });
  });

  // no ships placed, so no attacks
  it('should show blank status to defender', () => {
    return request(app.getHttpServer())
      .get(getStatusUrl)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.attacks).toBeDefined();
        expect(body.ships).toBeDefined();
        expect(body).toEqual({
          attacks: null,
          ships: [],
        });
      });
  });

  // no ships, so no attacks (later attacker might see different results from defender)
  it('should show blank status to attacker', () => {
    return request(app.getHttpServer())
      .get(getStatusUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.attacks).toBeDefined();
        expect(body.ships).toBeDefined();
        expect(body).toEqual({
          attacks: null,
          ships: [],
        });
      });
  });

  // place first group of ships
  for (const ship of mockData1) {
    it('should place first ship group', () => {
      return request(app.getHttpServer())
        .post(map[ship.key].url)
        .set('Authorization', 'bearer ' + token)
        .send({
          ...ship,
        })
        .expect(201)
        .expect(({ body }) => {
          // check response body
          testShipResponse(body, game_id, map[ship.key].type);
          // check if ship placed in correct position
          testCoordinates(body.coordinates, ship, map[ship.key].size);
        });
    });
  }

  // deny attacker from attacking since all ships are not placed
  it('should not allow attacks until all set', () => {
    return request(app.getHttpServer())
      .patch(attackUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .send({ x: 1, y: 1 })
      .expect(400)
      .expect(({ body }) => {
        testBadInput(body, 'defender has not placed all ships yet');
      });
  });

  // check if can prevent placing new ships in positions that violate game rules
  for (const ship of incorrectData) {
    it('should not place ship on invalid positions', () => {
      return request(app.getHttpServer())
        .post(map[ship.key].url)
        .set('Authorization', 'bearer ' + token)
        .send(ship)
        .expect(400)
        .expect(({ body }) => {
          testBadInput(
            body,
            'ships must have least one square between them in all directions',
          );
        });
    });
  }

  // check if can prevent ships from being placed out of board
  for (const ship of outOfBoard) {
    it('should not place ship out of board', () => {
      return request(app.getHttpServer())
        .post(map[ship.key].url)
        .set('Authorization', 'bearer ' + token)
        .send(ship)
        .expect(400)
        .expect(({ body }) => {
          testBadInput(body, 'ship cannot be placed within game board');
        });
    });
  }

  // deny attacker from attacking since all ships are not placed
  it('should not allow attacks until all set', () => {
    return request(app.getHttpServer())
      .patch(attackUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .send({ x: 1, y: 1 })
      .expect(400)
      .expect(({ body }) => {
        testBadInput(body, 'defender has not placed all ships yet');
      });
  });

  // should place second group of ships
  for (const ship of mockData2) {
    it('should place second ship group', () => {
      return request(app.getHttpServer())
        .post(map[ship.key].url)
        .set('Authorization', 'bearer ' + token)
        .send({
          ...ship,
        })
        .expect(201)
        .expect(({ body }) => {
          testShipResponse(body, game_id, map[ship.key].type);
          testCoordinates(body.coordinates, ship, map[ship.key].size);
        });
    });
  }

  // should deny excessive amount of ships
  for (const ship of extraData) {
    it('should not place extra ships', () => {
      return request(app.getHttpServer())
        .post(map[ship.key].url)
        .set('Authorization', 'bearer ' + token)
        .send({
          ...ship,
        })
        .expect(400)
        .expect(({ body }) => {
          testBadInput(body, `maximum amount of ${map[ship.key].type} reached`);
        });
    });
  }

  // defender cannot attack
  it('should not allow defender to attack', () => {
    return request(app.getHttpServer())
      .patch(attackUrl)
      .set('Authorization', 'bearer ' + token)
      .send({
        x: 1,
        y: 1,
      })
      .expect(403)
      .expect(({ body }) => {
        testBadInput(body, 'not permitted for the action');
      });
  });

  // validation error
  it('should not allow coordinate out of board and demand y', () => {
    return request(app.getHttpServer())
      .patch(attackUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .send(invalidAttack)
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();
        expect(body.error.x).toBeDefined();
        expect(body.error.x).toHaveLength(1);
        expect(body.error.x).toEqual([x.max]);
        expect(body.error.y).toBeDefined();
        expect(body.error.y).toHaveLength(4);
        expect(body.error.y).toEqual([y.empty, y.int, y.min, y.max]);
      });
  });

  // validation error
  it('should integer coordinate value', () => {
    return request(app.getHttpServer())
      .patch(attackUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .send(invalidAttack2)
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();
        expect(body.error.x).toBeDefined();
        expect(body.error.x).toHaveLength(3);
        expect(body.error.x).toEqual([x.int, x.min, x.max]);
        expect(body.error.y).toBeDefined();
        expect(body.error.y).toHaveLength(1);
        expect(body.error.y).toEqual([y.int]);
      });
  });

  // validation error
  it('should not allow negative or array of coordinate', () => {
    return request(app.getHttpServer())
      .patch(attackUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .send(invalidAttack3)
      .expect(400)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.error).toBeDefined();
        expect(body.error.x).toBeDefined();
        expect(body.error.x).toHaveLength(3);
        expect(body.error.x).toEqual([x.int, x.min, x.max]);
        expect(body.error.y).toBeDefined();
        expect(body.error.y).toHaveLength(1);
        expect(body.error.y).toEqual([y.min]);
      });
  });

  // no valid attacks so far
  it('should show empty attacks to defender', () => {
    const allShips = [...mockData1, ...mockData2];
    // picking a random ship
    const i = Math.floor(Math.random() * allShips.length);

    return request(app.getHttpServer())
      .get(getStatusUrl)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.attacks).toBeDefined();
        expect(body.ships).toBeDefined();
        expect(body.attacks).toBeNull(); // no attacks
        // should show all ships to defender
        expect(body.ships).toHaveLength(allShips.length);
        // test a random ship
        testShipResponse(body.ships[i], game_id, map[allShips[i].key].type);
        testCoordinates(
          body.ships[i].coordinates,
          allShips[i],
          map[allShips[i].key].size,
        );
      });
  });

  // no attacks so no ships sunk
  it('should show blank status to attacker', () => {
    return request(app.getHttpServer())
      .get(getStatusUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.attacks).toBeDefined();
        expect(body.ships).toBeDefined();
        expect(body).toEqual({
          attacks: null,
          ships: [],
        });
      });
  });

  // first group of attack moves
  for (const data of firstHalfAttack) {
    const type = map[data.key] ? map[data.key].type : undefined;
    it('should pass for ship attack', () => {
      return request(app.getHttpServer())
        .patch(attackUrl)
        .set('Authorization', 'bearer ' + attackerToken)
        .send(data)
        .expect(200)
        .expect(({ body }) => {
          testAttack(body, data, type, moves, misses);
        });
    });
  }

  // should not allow duplicate moves
  for (const data of duplicateCoord) {
    it('should not accept duplicate coordinate for attack', () => {
      return request(app.getHttpServer())
        .patch(attackUrl)
        .set('Authorization', 'bearer ' + attackerToken)
        .send(data)
        .expect(400)
        .expect(({ body }) => {
          testBadInput(body, 'coordinate already hit');
        });
    });
  }

  // show game status to defender
  it('should show correct status to defender', () => {
    return request(app.getHttpServer())
      .get(getStatusUrl)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.attacks).toBeDefined();
        expect(body.ships).toBeDefined();
        expect(body.ships).toHaveLength(shipStatusDefender.length);
        // for each expected ship
        for (const i in shipStatusDefender) {
          const type = map[shipStatusDefender[i].key].type; // ship type
          const size = map[shipStatusDefender[i].key].size; // no. of squares ship takes
          testShipResponse(
            body.ships[i],
            game_id,
            type,
            shipStatusDefender[i].is_sunk,
          );
          testCoordinates(
            body.ships[i].coordinates,
            shipStatusDefender[i],
            size,
            shipStatusDefender[i].is_hit,
          );
        }
        expect(body.attacks.game).toBeDefined();
        expect(body.attacks.game).toEqual(game_id);
        expect(body.attacks.game_over).toBeDefined();
        expect(body.attacks.game_over).toBeFalsy();

        expect(body.attacks.miss_count).toBeDefined();
        expect(body.attacks.hit_count).toBeDefined();
        expect(body.attacks.ship_sunk).toBeDefined();
        expect(body.attacks.miss_count).toEqual(miss_count);
        expect(body.attacks.hit_count).toEqual(hit_count);
        expect(body.attacks.ship_sunk).toEqual(ship_sunk);

        expect(body.attacks.coord_hit).toBeDefined();
        testAttackedCoords(body.attacks.coord_hit, firstHalfAttack);
      });
  });

  // show game status to attacker differently
  it('should show correct status to attacker', () => {
    return request(app.getHttpServer())
      .get(getStatusUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toBeDefined();
        expect(body.attacks).toBeDefined();
        expect(body.ships).toBeDefined();
        expect(body.ships).toHaveLength(shipStatusAttacker.length);
        // for each expected ship for attacker to see
        for (const i in shipStatusAttacker) {
          const type = map[shipStatusAttacker[i].key].type; // ship type
          const size = map[shipStatusAttacker[i].key].size; // no. of squares ship takes
          testShipResponse(body.ships[i], game_id, type, true);
          testCoordinates(
            body.ships[i].coordinates,
            shipStatusAttacker[i],
            size,
            true,
          );
        }
        expect(body.attacks.game).toBeDefined();
        expect(body.attacks.game).toEqual(game_id);
        expect(body.attacks.game_over).toBeDefined();
        expect(body.attacks.game_over).toBeFalsy();

        expect(body.attacks.miss_count).toBeDefined();
        expect(body.attacks.hit_count).toBeDefined();
        expect(body.attacks.ship_sunk).toBeDefined();
        expect(body.attacks.miss_count).toEqual(miss_count);
        expect(body.attacks.hit_count).toEqual(hit_count);
        expect(body.attacks.ship_sunk).toEqual(ship_sunk);

        expect(body.attacks.coord_hit).toBeDefined();
        testAttackedCoords(body.attacks.coord_hit, firstHalfAttack);
      });
  });

  it('should not let attack without attacker token', () => {
    return request(app.getHttpServer())
      .patch(attackUrl)
      .expect(401)
      .expect(({ body }) => {
        testBadInput(body, 'invalid credentials provided');
      });
  });

  // second group of attack moves
  for (const data of secondHalfAttack) {
    const type = map[data.key] ? map[data.key].type : undefined;
    it('should pass for battleship attack', () => {
      return request(app.getHttpServer())
        .patch(attackUrl)
        .set('Authorization', 'bearer ' + attackerToken)
        .send(data)
        .expect(200)
        .expect(({ body }) => {
          testAttack(body, data, type, moves, misses);
        });
    });
  }

  // cannot attack because game is over (no ships left to be sunk)
  for (const data of duplicateCoord) {
    it('should report all ships sunk', () => {
      return request(app.getHttpServer())
        .patch(attackUrl)
        .set('Authorization', 'bearer ' + attackerToken)
        .send(data)
        .expect(400)
        .expect(({ body }) => {
          testBadInput(body, 'all ships have been sunk already');
        });
    });
  }

  it('should show correct status to defender', () => {
    return request(app.getHttpServer())
      .get(getStatusUrl)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .expect(({ body }) => {
        const answer = [...mockData1, ...mockData2]; // all ships data
        expect(body).toBeDefined();
        expect(body.attacks).toBeDefined();
        expect(body.ships).toBeDefined();
        expect(body.ships).toHaveLength(answer.length);
        for (const i in answer) {
          const type = map[answer[i].key].type;
          const size = map[answer[i].key].size;
          testShipResponse(body.ships[i], game_id, type, true); // all ships are sunk
          testCoordinates(
            body.ships[i].coordinates,
            answer[i],
            size,
            true, // all coordinates are hit
          );
        }
        expect(body.attacks.game).toBeDefined();
        expect(body.attacks.game).toEqual(game_id);
        expect(body.attacks.game_over).toBeDefined();
        expect(body.attacks.game_over).toBeTruthy(); // game over

        expect(body.attacks.miss_count).toBeDefined();
        expect(body.attacks.hit_count).toBeDefined();
        expect(body.attacks.ship_sunk).toBeDefined();
        expect(body.attacks.hit_count).toEqual(moves - misses);
        expect(body.attacks.miss_count).toEqual(misses);
        expect(body.attacks.ship_sunk).toEqual(TOTAL_SHIPS);

        expect(body.attacks.coord_hit).toBeDefined();
        testAttackedCoords(body.attacks.coord_hit, [
          ...firstHalfAttack,
          ...secondHalfAttack,
        ]);
      });
  });

  it('should show correct status to attacker', () => {
    return request(app.getHttpServer())
      .get(getStatusUrl)
      .set('Authorization', 'bearer ' + attackerToken)
      .expect(200)
      .expect(({ body }) => {
        const answer = [...mockData1, ...mockData2];
        expect(body).toBeDefined();
        expect(body.attacks).toBeDefined();
        expect(body.ships).toBeDefined();
        expect(body.ships).toHaveLength(answer.length);
        for (const i in answer) {
          const type = map[answer[i].key].type;
          const size = map[answer[i].key].size;
          testShipResponse(body.ships[i], game_id, type, true); // all ships are sunk
          testCoordinates(
            body.ships[i].coordinates,
            answer[i],
            size,
            true, // all coordinates are hit
          );
        }
        expect(body.attacks.game).toBeDefined();
        expect(body.attacks.game).toEqual(game_id);
        expect(body.attacks.game_over).toBeDefined();
        expect(body.attacks.game_over).toBeTruthy(); // game over

        expect(body.attacks.miss_count).toBeDefined();
        expect(body.attacks.hit_count).toBeDefined();
        expect(body.attacks.ship_sunk).toBeDefined();
        expect(body.attacks.hit_count).toEqual(moves - misses);
        expect(body.attacks.miss_count).toEqual(misses);
        expect(body.attacks.ship_sunk).toEqual(TOTAL_SHIPS);

        expect(body.attacks.coord_hit).toBeDefined();
        testAttackedCoords(body.attacks.coord_hit, [
          ...firstHalfAttack,
          ...secondHalfAttack,
        ]);
      });
  });

  afterAll((done) => {
    mongoose.disconnect(done);
  });
});
