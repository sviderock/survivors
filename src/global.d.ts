/// <reference types="@solidjs/start/env" />

import type { PlayedGame } from "@/schema";
import type { StoredSessionData } from "~/lib/api/sessions";

declare global {
  type RectSides = { left: number; right: number; top: number; bottom: number };
  type RectCoords = { x: number; y: number };
  type RectSize = { width: number; height: number };
  type RectCenter = { centerX: number; centerY: number };
  type Rect = RectSides & RectCoords & RectSize & RectCenter;

  type World = {
    ref: HTMLDivElement | undefined;
    rect: Rect;
  };

  type TileRecord<T> = { [tileXY: string]: T };

  type BaseGameStateProps = {
    pingEnabled: boolean;
    enemySpawnInterval: number;
    experience: number;
    enemiesKilled: number;
    enemies: Enemy[];
    arrows: Arrow[];
    gems: Gem[];
    terrainRect: Rect;
    tileInfo: TileRecord<Rect>;
    occupiedTile: TileRecord<1 | undefined>;
    projectedTile: TileRecord<1 | undefined>;
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
    target: { x: number; y: number };
    damage: number;
    direction: AttackingDirection;
  };

  type Gem = {
    ref: HTMLSpanElement | undefined;
    rect: Rect;
    value: number;
  };

  type RGBStr = `rgb(${number},${"" | " "}${number},${"" | " "}${number})`;
  type RGB = { r: number; g: number; b: number };

  namespace App {
    interface RequestEventLocals {
      session: StoredSessionData | undefined;
      activeGame: PlayedGame | undefined;
    }
  }

  namespace Zerion {
    // Determined from an API response and transformed in TypeScript using https://transform.tools/json-to-typescript
    interface Root {
      links: Links;
      data: Data[];
    }

    interface Links {
      self: string;
      next: string;
    }

    interface Data {
      type: string; // 'transactions'
      id: string;
      attributes: Attributes;
      relationships: Relationships;
    }

    interface Attributes {
      operation_type:
        | "approve"
        | "borrow"
        | "burn"
        | "cancel"
        | "claim"
        | "deploy"
        | "deposit"
        | "execute"
        | "mint"
        | "receive"
        | "repay"
        | "send"
        | "stake"
        | "trade"
        | "unstake"
        | "withdraw";
      hash: string;
      mined_at_block: number;
      mined_at: string;
      sent_from: string;
      sent_to: string;
      status: "confirmed" | "failed" | "pending";
      nonce: number;
      fee: Fee;
      transfers: Transfer[];
      approvals: Approval[];
      application_metadata?: ApplicationMetadata;
      flags: AttributesFlags;
    }

    interface Fee {
      fungible_info: FungibleInfo;
      quantity: Quantity;
      price?: number | null;
      value?: number | null;
    }

    interface FungibleInfo {
      name: string;
      symbol: string;
      icon?: Icon | null;
      flags: Flags;
      implementations: Implementation[];
    }

    interface Icon {
      url: string;
    }

    interface Flags {
      verified?: boolean;
      is_spam?: boolean;
    }

    interface Implementation {
      chain_id: string;
      address: string;
      decimals: number;
    }

    interface Quantity {
      int: string;
      decimals: number;
      float: number;
      numeric: string;
    }

    interface NftInfo {
      contract_address: string;
      token_id: string;
      name: string;
      interface: string;
      content: Content;
      flags: Flags;
    }

    interface Content {
      preview: Preview;
      detail: Detail;
    }

    interface Preview {
      url: string;
    }

    interface Detail {
      url: string;
    }

    interface Transfer {
      nft_info?: NftInfo;
      fungible_info?: FungibleInfo;
      direction: "in" | "out" | "self";
      quantity: Quantity;
      value?: number | null;
      price?: number | null;
      sender: string;
      recipient: string;
    }

    interface Approval {
      fungible_info: FungibleInfo;
      quantity: Quantity;
      sender: string;
    }

    interface ApplicationMetadata {
      contract_address: string;
      method?: Method;
      name?: string;
      icon?: Icon;
    }

    interface Method {
      id: string;
      name: string;
    }

    interface AttributesFlags {
      is_trash: boolean;
    }

    interface Relationships {
      chain: Chain;
      dapp?: Dapp;
    }

    interface Chain {
      links: ChainLinks;
      data: ChainData;
    }

    interface ChainLinks {
      related: string;
    }

    interface ChainData {
      type: string;
      id: string;
    }

    interface Dapp {
      data: DappData;
    }

    interface DappData {
      type: string;
      id: string;
    }
  }
}
