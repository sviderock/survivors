import { batch, createEffect, onCleanup, onMount, ParentProps } from 'solid-js';
import { produce } from 'solid-js/store';
import { appkitModal } from '~/appkit';
import Banner from '~/components/Banner';
import Enemies from '~/components/Enemies';
import Gems from '~/components/Gems';
import Player, { setPlayer } from '~/components/Player';
import StageTimer from '~/components/StageTimer';
import UIStats from '~/components/UIStats';
import UserAccount, { useLogout } from '~/components/UserAccount';
import Bullet from '~/components/weapons/Bullets';
import { PLAYER_FREE_MOVEMENT } from '~/constants';
import { clearGameLoop, runGameLoop } from '~/gameLoop';
import {
	connectedUser,
	gameState,
	keyPressed,
	resetGameState,
	setConnectedUser,
	setGameState,
	setKeyPressed,
	setLastPressedCombination,
	stageTimer,
	useGameTimer,
	worldPos,
} from '~/state';
import useGameServer, { gameServer } from '~/useGameServer';
import { encodeJson } from '~/utils';
import type { ContinueGameEvent, GameServerEvent, PauseGameEvent } from '~/ws';

function onKeyDown(e: KeyboardEvent) {
	if (e.code === 'Escape' || e.code === 'KeyP') {
		if (gameState.status === 'paused') {
			setGameState('status', 'in_progress');
			gameServer!.send(encodeJson<ContinueGameEvent>({ type: 'continue_game' }));
			return;
		}

		if (gameState.status === 'in_progress') {
			setGameState('status', 'paused');
			gameServer!.send(
				encodeJson<PauseGameEvent>({ type: 'pause_game', timePassedInMs: stageTimer() }),
			);
			return;
		}

		return;
	}

	if (e.code === 'Space') {
		if (gameState.status === 'not_started') {
			gameServer?.send(encodeJson({ type: 'init_game_start' } as GameServerEvent));
			return;
		}

		if (gameState.status === 'active_game_found') {
			setGameState('status', 'in_progress');
			gameServer?.send(encodeJson({ type: 'continue_game' } as GameServerEvent));
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

	if (gameState.status === 'in_progress' || PLAYER_FREE_MOVEMENT) {
		if (e.code === 'KeyW' || e.code === 'ArrowUp') return setKeyPressed('w', true);
		if (e.code === 'KeyS' || e.code === 'ArrowDown') return setKeyPressed('s', true);
		if (e.code === 'KeyA' || e.code === 'ArrowLeft') return setKeyPressed('a', true);
		if (e.code === 'KeyD' || e.code === 'ArrowRight') return setKeyPressed('d', true);
	}
}

function onKeyUp(e: KeyboardEvent) {
	if (gameState.status === 'in_progress' || PLAYER_FREE_MOVEMENT) {
		if (e.code === 'KeyW' || e.code === 'ArrowUp') return setKeyPressed('w', false);
		if (e.code === 'KeyS' || e.code === 'ArrowDown') return setKeyPressed('s', false);
		if (e.code === 'KeyA' || e.code === 'ArrowLeft') return setKeyPressed('a', false);
		if (e.code === 'KeyD' || e.code === 'ArrowRight') return setKeyPressed('d', false);
	}
}

function onBeforeUnload(e: BeforeUnloadEvent) {
	e.preventDefault();
	setGameState('status', 'paused');
	gameServer!.send(
		encodeJson<PauseGameEvent>({ type: 'pause_game', timePassedInMs: stageTimer() }),
	);
}

export default function Game() {
	const logout = useLogout();
	useGameServer();
	useGameTimer();

	createEffect(() => {
		if (gameState.status !== 'in_progress' && gameState.status !== 'paused') return;

		window.addEventListener('beforeunload', onBeforeUnload);
		onCleanup(() => {
			window.removeEventListener('beforeunload', onBeforeUnload);
		});
	});

	onMount(async () => {
		appkitModal.subscribeAccount((data) => {
			if (
				connectedUser.status === 'connected' &&
				data.status === 'disconnected' &&
				data.isConnected === false
			) {
				logout.mutate();
			}
			setConnectedUser(data);
		});

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		onCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
			clearGameLoop();
		});
	});

	createEffect(() => {
		if (gameState.status === 'in_progress' || PLAYER_FREE_MOVEMENT) {
			runGameLoop();
		}
	});

	createEffect(() => {
		batch(() => {
			switch (true) {
				case keyPressed.w && keyPressed.a: {
					setPlayer(
						'state',
						produce((state) => {
							state.type = 'moving';
							state.direction = 'west';
						}),
					);
					setLastPressedCombination('wa');
					break;
				}
				case keyPressed.w && keyPressed.d: {
					setPlayer(
						'state',
						produce((state) => {
							state.type = 'moving';
							state.direction = 'east';
						}),
					);
					setLastPressedCombination('wd');
					break;
				}
				case keyPressed.s && keyPressed.a: {
					setPlayer(
						'state',
						produce((state) => {
							state.type = 'moving';
							state.direction = 'west';
						}),
					);
					setLastPressedCombination('sa');
					break;
				}
				case keyPressed.s && keyPressed.d: {
					setPlayer(
						'state',
						produce((state) => {
							state.type = 'moving';
							state.direction = 'east';
						}),
					);
					setLastPressedCombination('sd');
					break;
				}
				case keyPressed.w: {
					setPlayer(
						'state',
						produce((state) => {
							state.type = 'moving';
						}),
					);
					setLastPressedCombination('w');
					break;
				}
				case keyPressed.s: {
					setPlayer(
						'state',
						produce((state) => {
							state.type = 'moving';
						}),
					);
					setLastPressedCombination('s');
					break;
				}
				case keyPressed.a: {
					setPlayer(
						'state',
						produce((state) => {
							state.type = 'moving';
							state.direction = 'west';
						}),
					);
					setLastPressedCombination('a');
					break;
				}
				case keyPressed.d: {
					setPlayer(
						'state',
						produce((state) => {
							state.type = 'moving';
							state.direction = 'east';
						}),
					);
					setLastPressedCombination('d');
					break;
				}

				default:
					setPlayer(
						'state',
						produce((state) => {
							state.type = 'idle';
						}),
					);
					break;
			}
		});
	});

	return (
		<div class="relative h-lvh w-full overflow-hidden">
			<GameWorld>
				<Enemies />
				<Bullet />
				<Gems />
			</GameWorld>

			<Player />
			{/* <Banner /> */}
			<UserAccount />
			<StageTimer />
			<UIStats />
		</div>
	);
}

function GameWorld(props: ParentProps) {
	return (
		<div
			class="bg-size absolute h-[10000px] w-[10000px] bg-forest bg-[100px_100px]"
			style={{ transform: `translate3d(${worldPos().x}px, ${worldPos().y}px, 0)` }}
		>
			{props.children}
		</div>
	);
}
