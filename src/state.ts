import { createTimer } from '@solid-primitives/timer';
import { batch, createSignal } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { setPlayer } from '~/components/Player';
import { BASE_COOLDOWN, BASE_HEALTH, WORLD_SIZE } from '~/constants';
import { sendWS } from '~/useGameServer';
import { getInitialRect } from '~/utils';

function getInitialGameState(): GameState {
	return {
		pingEnabled: false,
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

export const [worldRect, setWorldRect] = createSignal(
	getInitialRect({ x: 0, y: 0, width: WORLD_SIZE, height: WORLD_SIZE }),
);
export const [gameState, setGameState] = createStore<GameState>(getInitialGameState());
export const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false });
export const [stageTimer, setStageTimer] = createSignal(0);
export const [ping, setPing] = createSignal(0);

export function resetGameState() {
	batch(() => {
		setGameState(getInitialGameState());
		setKeyPressed({ w: false, s: false, a: false, d: false });
		setStageTimer(0);
		setPlayer(
			produce((player) => {
				player.health = BASE_HEALTH;
				player.maxHealth = BASE_HEALTH;
				player.movement = 'idle';
				player.direction = 'east';
				player.attack = {
					status: 'ready',
					direction: 'east',
					cooldown: BASE_COOLDOWN,
				};
			}),
		);
	});
}

export function useGameTimer() {
	createTimer(
		async () => {
			if (!gameState.activeGame) return;
			if (stageTimer() >= gameState.activeGame.timeLimit) {
				setGameState('status', 'won');
				sendWS({ type: 'game_won' });
				return;
			}
			setStageTimer((p) => p + 500);
		},
		() => gameState.status === 'in_progress' && 500,
		setInterval,
	);
}
