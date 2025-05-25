import { api } from "@/convex/_generated/api";
import type { DataModel } from "@/convex/_generated/dataModel";
import EventEmitter from "events";
import { DIAGONAL_SPEED, GAME_UPDATE_INTERVAL, PLAYER_SERVER_SPEED } from "~/constants";
import Player from "~/lib/classes/Player";
import convexClient from "~/lib/convexClient";

export interface PublicGameState {
  players: { [playerName: string]: { pos: Nums<"x" | "y"> } };
}

export default class Game {
  #interval: NodeJS.Timeout | undefined;
  #id: DataModel["games"]["document"]["_id"];
  status: DataModel["games"]["document"]["status"];
  players: Player[];
  playerByName: Map<string, Player>;
  ee: EventEmitter<{ worldState: [PublicGameState] }>;

  constructor(game: DataModel["games"]["document"]) {
    this.ee = new EventEmitter();
    this.#id = game._id;
    this.status = game.status;
    this.players = Object.values(game.players).map((p) => new Player(p));
    this.playerByName = new Map(this.players.map((p) => [p.name, p]));
  }

  get isPaused() {
    return this.status === "paused";
  }

  get #publicGameStateSerialized(): PublicGameState {
    return {
      players: this.players.reduce<PublicGameState["players"]>((acc, p) => {
        acc[p.name] = { pos: p.pos };
        return acc;
      }, {}),
    };
  }

  start() {
    clearInterval(this.#interval);
    this.#interval = setInterval(() => {
      this.#processdState();
      this.ee.emit("worldState", this.#publicGameStateSerialized);
    }, GAME_UPDATE_INTERVAL);
  }

  pause() {
    clearInterval(this.#interval);
    this.status = "paused";
  }

  async getPlayer(playerName: string) {
    const player = this.playerByName.get(playerName);
    if (!player) {
      await convexClient.mutation(api.games.addPlayer, { gameId: this.#id, playerName });
    }

    return this.playerByName.get(playerName)!;
  }

  #processPlayers() {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]!;
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
    this.#processPlayers();
  }
}
