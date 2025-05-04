import EventEmitter from "events";
import { DIAGONAL_SPEED, GAME_UPDATE_INTERVAL, PLAYER_SERVER_SPEED } from "~/constants";
import Player from "~/lib/classes/Player";

export interface GameServerState {
  tick: number;
  players: Array<Player>;
}

export default class Game {
  #interval: NodeJS.Timeout | undefined;
  state: GameServerState;
  ee: EventEmitter<{ worldState: [GameServerState] }>;

  constructor() {
    this.ee = new EventEmitter();
    this.state = {
      tick: 0,
      players: [new Player()],
    };
  }

  get isPaused() {
    return !this.#interval;
  }

  start() {
    clearInterval(this.#interval);
    this.#interval = setInterval(() => {
      this.#processdState();
      this.ee.emit("worldState", this.state);
    }, GAME_UPDATE_INTERVAL);
  }

  stop() {
    clearInterval(this.#interval);
  }

  addPlayer() {
    this.state.players.push(new Player());
  }

  getPlayer(i: number) {
    return this.state.players[i]!;
  }

  #processPlayers() {
    for (let i = 0; i < this.state.players.length; i++) {
      const player = this.state.players[i]!;
      const { keyPressed } = player;
      const playerSpeedModifier =
        (keyPressed.w && keyPressed.a) ||
        (keyPressed.w && keyPressed.d) ||
        (keyPressed.s && keyPressed.a) ||
        (keyPressed.s && keyPressed.d)
          ? DIAGONAL_SPEED
          : 1;

      if (keyPressed.w) player.pos.y += (PLAYER_SERVER_SPEED * playerSpeedModifier) | 0;
      if (keyPressed.s) player.pos.y -= (PLAYER_SERVER_SPEED * playerSpeedModifier) | 0;
      if (keyPressed.a) player.pos.x += (PLAYER_SERVER_SPEED * playerSpeedModifier) | 0;
      if (keyPressed.d) player.pos.x -= (PLAYER_SERVER_SPEED * playerSpeedModifier) | 0;
    }
  }

  #processdState() {
    this.state.tick++;
    this.#processPlayers();
  }
}
