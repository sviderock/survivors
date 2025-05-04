/// <reference types="@solidjs/start/env" />

import type { PlayedGame } from "@/schema";
import type { StoredSessionData } from "~/lib/api/sessions";

declare global {
  type Nums<T extends string> = { [key in T]: number };

  type RectSides = Nums<"left" | "right" | "top" | "bottom">;
  type RectCoords = Nums<"x" | "y">;
  type RectSize = Nums<"width" | "height">;
  type RectCenter = Nums<"centerX" | "centerY">;
  type Rect = RectSides & RectCoords & RectSize & RectCenter;

  type World = {
    ref: HTMLDivElement | undefined;
    rect: Rect;
  };

  type TileRecord<T> = { [tileXY: string]: T };

  interface CommonGameStateProps {
    occupiedTile: TileRecord<1 | undefined>;
    projectedTile: TileRecord<1 | undefined>;
  }

  type BaseGameStateProps = CommonGameStateProps & {
    pingEnabled: boolean;
    enemySpawnInterval: number;
    experience: number;
    enemiesKilled: number;
    enemies: Enemy[];
    arrows: Arrow[];
    gems: Gem[];
    terrainRect: Rect;
  };

  type StatusBasedProps =
    | {
        status: "in_progress" | "paused" | "won" | "lost" | "active_game_found";
        activeGame: PlayedGame;
      }
    | {
        status: "not_started";
        activeGame: null;
      };

  type GameState = BaseGameStateProps & StatusBasedProps;

  type Tile = { row: number; col: number };

  type AttackingDirection =
    | "north-west"
    | "north"
    | "north-east"
    | "east"
    | "south-east"
    | "south"
    | "south-west"
    | "west";

  type Player = {
    ref: HTMLDivElement | undefined;
    health: number;
    maxHealth: number;
    movement: "idle" | "moving";
    direction: "east" | "west";
    attack: {
      status: "ready" | "started_attack" | "cooldown";
      direction: AttackingDirection;
      cooldown: number;
    };
    occupiedTile: Tile;
    magnet: number;
  };

  type Direction = 1 | 0 | -1;

  type Enemy = {
    ref: HTMLDivElement | undefined;
    rect: Rect;
    attack: number;
    attackStatus: "ready" | "hit" | "cooldown";
    health: number;
    maxHealth: number;
    blocked: { x: Direction; y: Direction };
    status: "idle" | "moving" | "attacking" | "hit";
    lifeStatus: "alive" | "died" | "show_skull" | "skull_gone";
    dirX: Direction;
    dirY: Direction;
    occupiedTile: Tile;
    nextTile: Tile;
    playerReached: boolean;
  };

  type Arrow = {
    ref: HTMLSpanElement | undefined;
    rect: Rect;
    target: Nums<"x" | "y">;
    damage: number;
    direction: AttackingDirection;
    hitbox: Rect;
    hitboxRef: HTMLSpanElement | undefined;
  };

  type Gem = {
    ref: HTMLSpanElement | undefined;
    rect: Rect;
    value: number;
    status: "not_picked_up" | "flying" | "picked_up";
    level: 1 | 2 | 3;
  };

  type RGBStr = `rgb(${number},${"" | " "}${number},${"" | " "}${number})`;
  type RGB = { r: number; g: number; b: number };

  type KeyPressed = {
    w: boolean;
    s: boolean;
    a: boolean;
    d: boolean;
  };

  namespace App {
    interface RequestEventLocals {
      session: StoredSessionData | undefined;
      activeGame: PlayedGame | undefined;
    }
  }
}
