import { type UseAppKitAccountReturn } from '@reown/appkit';
import { batch, createSignal } from 'solid-js';
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

export function createSingleEnemy({ x, y }: { x: number; y: number }): Enemy {
	const [rect, setRect] = createSignal(getInitialRect({ x, y }));
	return { ref: undefined, rect, setRect };
}

export const [gameState, setGameState] = createStore({
	experience: 0,
	status: 'not_started' as 'not_started' | 'in_progress' | 'paused' | 'won' | 'lost',
});

export const [enemies, setEnemies] = createStore<Enemy[]>([]);
export const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false });
export const [worldPos, setWorldPos] = createSignal({ x: 0, y: 0 });
export const [stageTimer, setStageTimer] = createSignal(0);

export function resetGameState() {
	batch(() => {
		setEnemies([]);
		setWorldPos({ x: 0, y: 0 });
		setGameState({ experience: 0, status: 'in_progress' });
		setLastPressedCombination('w');
		setKeyPressed({ w: false, s: false, a: false, d: false });
		setStageTimer(0);
	});
}
