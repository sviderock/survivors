import { UseAppKitAccountReturn } from '@reown/appkit';
import { createSignal, type Signal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { getInitialRect } from '~/utils';

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

export function createSingleEnemy({ x, y }: { x: number; y: number }): Signal<Rect> {
	const [enemy, setEnemy] = createSignal(getInitialRect({ x, y }));
	return [enemy, setEnemy];
}

export function createEnemies() {
	const [enemies, setEnemies] = createSignal<Signal<Rect>[]>([]);
	return [enemies, setEnemies] as const;
}

export const [gameState, setGameState] = createStore({
	experience: 0,
	status: 'not_started' as 'not_started' | 'in_progress' | 'paused' | 'won' | 'lost',
});

export const [enemies, setEnemies] = createEnemies();
export const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false });
export const [worldPos, setWorldPos] = createSignal({ x: 0, y: 0 });
