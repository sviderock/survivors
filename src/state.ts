import { type UseAppKitAccountReturn } from '@reown/appkit';
import { createTimer } from '@solid-primitives/timer';
import { batch, createSignal } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { queryClient } from '~/app';
import { setPlayer } from '~/components/Player';
import { BASE_HEALTH } from '~/constants';
import { gameServer } from '~/useGameServer';
import { encodeEvent } from '~/utils';

export const [connectedUser, setConnectedUser] = createStore<UseAppKitAccountReturn>({
	address: undefined,
	allAccounts: [],
	caipAddress: undefined,
	isConnected: false,
	status: undefined,
	embeddedWalletInfo: undefined,
});

function getInitialGameState(): GameState {
	return {
		pingEnabled: false,
		bulletSpawnInterval: 0,
		enemySpawnInterval: 0,
		experience: 0,
		enemiesKilled: 0,
		status: 'not_started',
		enemies: [],
		bullets: [],
		gems: [],
		activeGame: null,
	};
}

export const [gameState, setGameState] = createStore<GameState>(getInitialGameState());
export const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false });
export const [worldPos, setWorldPos] = createSignal({ x: 0, y: 0 });
export const [stageTimer, setStageTimer] = createSignal(0);
export const [ping, setPing] = createSignal(0);

export type LastPressedCombination = ReturnType<typeof lastPressedCombination>;
export const [lastPressedCombination, setLastPressedCombination] = createSignal(
	'w' as 'wa' | 'wd' | 'sa' | 'sd' | 'w' | 's' | 'a' | 'd',
);

export function resetGameState() {
	batch(() => {
		setGameState(getInitialGameState());
		setWorldPos({ x: 0, y: 0 });
		setLastPressedCombination('w');
		setKeyPressed({ w: false, s: false, a: false, d: false });
		setStageTimer(0);
		setPlayer((p) => ({ ...p, health: BASE_HEALTH, maxHealth: BASE_HEALTH }));
	});
}

export function useGameTimer() {
	createTimer(
		async () => {
			if (!gameState.activeGame) return;

			if (stageTimer() >= gameState.activeGame.timeLimit) {
				setGameState('status', 'won');
				if (gameServer) {
					gameServer.send(encodeEvent({ type: 'game_won' }));
				}
				return;
			}

			setStageTimer((p) => p + 500);
		},
		() => gameState.status === 'in_progress' && 500,
		setInterval,
	);
}
