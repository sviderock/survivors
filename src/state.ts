import type { PlayedGame } from '@/schema';
import { type UseAppKitAccountReturn } from '@reown/appkit';
import { createTimer } from '@solid-primitives/timer';
import { batch, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { setEnemies } from '~/components/Enemies';
import { setGems } from '~/components/Gems';
import { setPlayer } from '~/components/Player';
import { setBullets } from '~/components/weapons/Bullets';
import { BASE_HEALTH } from '~/constants';

export const [connectedUser, setConnectedUser] = createStore<UseAppKitAccountReturn>({
	address: undefined,
	allAccounts: [],
	caipAddress: undefined,
	isConnected: false,
	status: undefined,
	embeddedWalletInfo: undefined,
});

export type LastPressedCombination = ReturnType<typeof lastPressedCombination>;
export const [lastPressedCombination, setLastPressedCombination] = createSignal(
	'w' as 'wa' | 'wd' | 'sa' | 'sd' | 'w' | 's' | 'a' | 'd',
);

export const [gameState, setGameState] = createStore({
	bulletSpawnInterval: 0,
	enemySpawnInterval: 0,
	experience: 0,
	enemiesKilled: 0,
	gameInstance: null as PlayedGame | null,
	status: 'not_started' as
		| 'not_started'
		| 'in_progress'
		| 'paused'
		| 'won'
		| 'lost'
		| 'active_game_found',
});

export const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false });
export const [worldPos, setWorldPos] = createSignal({ x: 0, y: 0 });
export const [stageTimer, setStageTimer] = createSignal(0);

export function resetGameState() {
	batch(() => {
		setEnemies([]);
		setBullets([]);
		setGems([]);
		setWorldPos({ x: 0, y: 0 });
		setGameState({
			enemySpawnInterval: 0,
			bulletSpawnInterval: 0,
			experience: 0,
			enemiesKilled: 0,
			status: 'not_started',
			gameInstance: null,
		});
		setLastPressedCombination('w');
		setKeyPressed({ w: false, s: false, a: false, d: false });
		setStageTimer(0);
		setPlayer((p) => ({ ...p, health: BASE_HEALTH, maxHealth: BASE_HEALTH }));
	});
}

export const [ping, setPing] = createSignal(0);

export const roundTimer = createTimer(
	() => gameState.status === 'in_progress' && setStageTimer((p) => p + 500),
	500,
	setInterval,
);
