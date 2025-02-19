/// <reference types="@solidjs/start/env" />

import type { PlayedGame } from '@/schema';
import type { Accessor, Setter } from 'solid-js';

declare global {
	type RectSides = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;
	type RectCoords = Pick<DOMRect, 'x' | 'y'>;
	type RectSize = Pick<DOMRect, 'width' | 'height'>;
	type RectCenter = { centerX: number; centerY: number };
	type Rect = RectSides & RectCoords & RectSize & RectCenter;

	type World = {
		ref: HTMLDivElement | undefined;
		rect: Rect;
	};

	type BaseGameStateProps = {
		pingEnabled: boolean;
		bulletSpawnInterval: number;
		enemySpawnInterval: number;
		experience: number;
		enemiesKilled: number;
		enemies: Enemy[];
		bullets: Bullet[];
		gems: Gem[];
	};

	type StatusBasedProps =
		| {
				status: 'in_progress' | 'paused' | 'won' | 'lost' | 'active_game_found';
				activeGame: PlayedGame;
		  }
		| {
				status: 'not_started';
				activeGame: null;
		  };

	type GameState = BaseGameStateProps & StatusBasedProps;

	type Player = {
		ref: HTMLDivElement | undefined;
		rect: Rect;
		health: number;
		maxHealth: number;
		state: {
			type: 'idle' | 'moving' | 'attacking';
			direction: 'east' | 'west';
		};
	};

	type EnemyAttackStatus = 'ready' | 'hit' | 'cooldown';
	type Enemy = {
		ref: HTMLDivElement | undefined;
		rect: Accessor<Rect>;
		setRect: Setter<Rect>;
		attack: number;
		attackStatus: Accessor<EnemyAttackStatus>;
		setAttackStatus: Setter<EnemyAttackStatus>;
		health: number;
		maxHealth: number;
		blocked: Record<keyof RectSides, boolean>;
		status: 'idle' | 'moving' | 'attacking';
		direction: 'east' | 'west';
	};

	type Bullet = {
		ref: HTMLSpanElement | undefined;
		rect: Accessor<Rect>;
		setRect: Setter<Rect>;
		target: { x: number; y: number };
		damage: number;
	};

	type Gem = {
		ref: HTMLSpanElement | undefined;
		rect: Accessor<Rect>;
		setRect: Setter<Rect>;
		value: number;
	};

	type RGBStr = `rgb(${number},${'' | ' '}${number},${'' | ' '}${number})`;
	type RGB = { r: number; g: number; b: number };

	namespace App {
		interface RequestEventLocals {
			// session: StoredSessionData | null | undefined;
			// activeGame: PlayedGame | undefined;
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
				| 'approve'
				| 'borrow'
				| 'burn'
				| 'cancel'
				| 'claim'
				| 'deploy'
				| 'deposit'
				| 'execute'
				| 'mint'
				| 'receive'
				| 'repay'
				| 'send'
				| 'stake'
				| 'trade'
				| 'unstake'
				| 'withdraw';
			hash: string;
			mined_at_block: number;
			mined_at: string;
			sent_from: string;
			sent_to: string;
			status: 'confirmed' | 'failed' | 'pending';
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
			direction: 'in' | 'out' | 'self';
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
