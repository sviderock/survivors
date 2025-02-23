import { batch, createEffect, onCleanup, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { setPlayer } from '~/components/Player';
import { stageTimer } from '~/components/StageTimer';
import { sendWS } from '~/lib/gameServer';
import { gameState, resetGameState, setGameState } from '~/state';

export const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false });

export function setupKeyboardEvents() {
	onMount(async () => {
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		onCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
		});
	});

	createEffect(() => {
		batch(() => {
			switch (true) {
				case keyPressed.w && keyPressed.a: {
					setPlayer(
						produce((state) => {
							state.movement = 'moving';
							state.direction = 'west';
							state.attack.direction = 'north-west';
						}),
					);
					break;
				}
				case keyPressed.w && keyPressed.d: {
					setPlayer(
						produce((state) => {
							state.movement = 'moving';
							state.direction = 'east';
							state.attack.direction = 'north-east';
						}),
					);
					break;
				}
				case keyPressed.s && keyPressed.a: {
					setPlayer(
						produce((state) => {
							state.movement = 'moving';
							state.direction = 'west';
							state.attack.direction = 'south-west';
						}),
					);
					break;
				}
				case keyPressed.s && keyPressed.d: {
					setPlayer(
						produce((state) => {
							state.movement = 'moving';
							state.direction = 'east';
							state.attack.direction = 'south-east';
						}),
					);
					break;
				}
				case keyPressed.w: {
					setPlayer(
						produce((state) => {
							state.movement = 'moving';
							state.attack.direction = 'north';
						}),
					);
					break;
				}
				case keyPressed.s: {
					setPlayer(
						produce((state) => {
							state.movement = 'moving';
							state.attack.direction = 'south';
						}),
					);
					break;
				}
				case keyPressed.a: {
					setPlayer(
						produce((state) => {
							state.movement = 'moving';
							state.direction = 'west';
							state.attack.direction = 'west';
						}),
					);
					break;
				}
				case keyPressed.d: {
					setPlayer(
						produce((state) => {
							state.movement = 'moving';
							state.direction = 'east';
							state.attack.direction = 'east';
						}),
					);
					break;
				}

				default:
					setPlayer(
						produce((state) => {
							state.movement = 'idle';
						}),
					);
					break;
			}
		});
	});
}

function onKeyDown(e: KeyboardEvent) {
	if (e.code === 'Escape' || e.code === 'KeyP') {
		if (gameState.status === 'paused') {
			setGameState('status', 'in_progress');
			sendWS({ type: 'continue_game' });
			return;
		}

		if (gameState.status === 'in_progress') {
			setGameState('status', 'paused');
			sendWS({ type: 'pause_game', timePassedInMs: stageTimer() });
			return;
		}

		return;
	}

	if (e.code === 'Space') {
		console.log(gameState.status);
		if (gameState.status === 'not_started') {
			sendWS({ type: 'init_game_start' });
			return;
		}

		if (gameState.status === 'active_game_found') {
			setGameState('status', 'in_progress');
			sendWS({ type: 'continue_game' });
			return;
		}

		if (gameState.status === 'won') {
			resetGameState();
			return;
		}

		return;
	}

	if (e.code === 'KeyR') {
		if (gameState.status === 'lost') {
			return resetGameState();
		}
		return;
	}

	if (gameState.status === 'in_progress') {
		if (e.code === 'KeyW' || e.code === 'ArrowUp') return setKeyPressed('w', true);
		if (e.code === 'KeyS' || e.code === 'ArrowDown') return setKeyPressed('s', true);
		if (e.code === 'KeyA' || e.code === 'ArrowLeft') return setKeyPressed('a', true);
		if (e.code === 'KeyD' || e.code === 'ArrowRight') return setKeyPressed('d', true);
	}
}

function onKeyUp(e: KeyboardEvent) {
	if (gameState.status === 'in_progress') {
		if (e.code === 'KeyW' || e.code === 'ArrowUp') return setKeyPressed('w', false);
		if (e.code === 'KeyS' || e.code === 'ArrowDown') return setKeyPressed('s', false);
		if (e.code === 'KeyA' || e.code === 'ArrowLeft') return setKeyPressed('a', false);
		if (e.code === 'KeyD' || e.code === 'ArrowRight') return setKeyPressed('d', false);
	}
}
