import { type UseAppKitAccountReturn } from '@reown/appkit';
import { batch, createMemo, createRoot, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { setEnemies } from '~/components/Enemies';
import { setBullets } from '~/components/weapons/Bullets';

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
	experience: 0,
	status: 'not_started' as 'not_started' | 'in_progress' | 'paused' | 'won' | 'lost',
});

export const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false });
export const [worldPos, setWorldPos] = createSignal({ x: 0, y: 0 });
export const [stageTimer, setStageTimer] = createSignal(0);

export function resetGameState() {
	batch(() => {
		setEnemies([]);
		setBullets([]);
		setWorldPos({ x: 0, y: 0 });
		setGameState({ experience: 0, status: 'in_progress' });
		setLastPressedCombination('w');
		setKeyPressed({ w: false, s: false, a: false, d: false });
		setStageTimer(0);
	});
}

export const { speedModifier } = createRoot(() => {
	const speedModifier = createMemo(() => {
		if (
			lastPressedCombination() === 'wa' ||
			lastPressedCombination() === 'wd' ||
			lastPressedCombination() === 'sa' ||
			lastPressedCombination() === 'sd'
		) {
			return Math.SQRT2 / 2;
		}
		return 1;
	});

	return { speedModifier };
});
