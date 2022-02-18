[![Maintainability](https://api.codeclimate.com/v1/badges/0b54c98e42d5660f666b/maintainability)](https://codeclimate.com/github/ppkgtmm/bts/maintainability)

## Assumptions with game rules
1. Defender and attacker must complete the game without rejoining (only one attacker and one defender per game allowed)
2. Defender will create new game session to get defender credentials and send the responded game id to the attacker
3. Attacker have to enter the game by using defender provided game id to get attacker credentials
4. Only defender can place ships onto game board with valid credentials (one ship per time)
5. Attacker can only attack when defender has placed all the ships (only attacker with valid credentials is authorized to make attacks)
6. There are total of 10 ships per game namely 1x Battleship, 2x Cruisers, 3x Destroyers and 4x Submarines
7. Number of squares for each ship type is as shown below

<table align="center">
  <tr>
    <th>Ship Type</th>
    <th>Squares per ship</th>
  </tr>
  <tr>
    <td>battleship</td>
    <td align="center">4</td>
  </tr>
  <tr>
    <td>cruiser</td>
    <td align="center">3</td>
  </tr>
  <tr>
    <td>destroyer</td>
    <td align="center">2</td>
  </tr>
  <tr>
    <td>submarine</td>
    <td align="center">3</td>
  </tr>
</table>

8. Defender will specify alignment of ship with a coordinate which could be either top most coordinate (vertical ship) or left most coordinate (horizontal ship)
9. Attacker can shoot only one coordinate per time
10. If same coordinate is used for attack more than once, the attack will not be counted as hit or miss
11. Game status which is shown to defender and attacker might be different
* Defender can see attacks history and status of all ships placed (including coordinates)
* Attacker can see attacks history, and all sunk ships(ships that have all squares of them shot) with their coordinates

## Usage
#### URL
```http
"http://localhost:3000/"
``` 
#### Paths
1. Create new game endpoint

* Creates a new game. Anyone who hit this endpoint will become game defender
```http
POST "api/game/new/"
```
2. Enter game endpoint

* Lets user enter the game as attacker
```http
PATCH "api/game/enter/"
```
#### Request Body
```json
{
  "game_id": "defender_provided_game_id"
}
```
3. Get status endpoint

* Provides game status to attacker or defender. Valid credentials needed. 
```http
GET "api/game/status/"
```
4. Place ship endpoint
* Lets defender with valid credentials place a ship per request. Remember to specify ship_type
```http
POST "api/ship/:ship_type/"
```
#### Request Body
```json
{
  "start_x": "start_coordinate_x",
  "start_y": "start_coordinate_y",
  "is_verticle": "true_or_false"
}
```
5. Attack endpoint

* Lets attacker with valid credentials make attacks to the ships
```http
PATCH "api/attack/"
```
#### Request Body
```json
{
  "x": "attack_coordinate_x",
  "y": "attack_coordinare_y"
}
```

## Set up
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

2. Run below to install required dependencies

```bash
# install required dependencies
$ npm install
```

3. Set up database

```bash
# create and run database container
$ docker-compose up -d
```

4. At project root directory, create file .env then paste the content below to the file
```bash
DB_URL=mongodb://localhost/battle_ship
PRIVATE_KEY=ThiSisAseCRETKeY
EXPIRES_IN=1h
```

## Running the app
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test
```bash
# e2e tests
$ npm run test:e2e
```

## Tear down
```bash
# stop and remove database container
$ docker-compose down
```
