import { type UseAppKitAccountReturn } from '@reown/appkit';
import { createAsync } from '@solidjs/router';
import { batch, createEffect, onCleanup, onMount, ParentProps } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { appkitModal } from '~/appkit';
import * as divvi from '~/blockchain/divvi';
import Enemies from '~/components/Enemies';
import Gems from '~/components/Gems';
import Player, { setPlayer } from '~/components/Player';
import StageTimer from '~/components/StageTimer';
import UIStats from '~/components/UIStats';
import UserAccount, { useCurrentUser, useLogout } from '~/components/UserAccount';
import Bullet from '~/components/weapons/Bullets';
import { PLAYER_FREE_MOVEMENT, WORLD_SIZE } from '~/constants';
import { clearGameLoop, runGameLoop } from '~/gameLoop';
import type { PatchUsersBody } from '~/routes/api/users';
import {
	gameState,
	keyPressed,
	resetGameState,
	setGameState,
	setKeyPressed,
	stageTimer,
	useGameTimer,
	worldRect,
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

function useDivviSync() {
	const user = useCurrentUser();
	return createAsync(async () => {
		return;
		if (!user.data) return;
		console.log('???');

		// if we haven't checked this user yet
		if (user.data.divviRegistration.status === 'unchecked') {
			const unregisteredProtocols = await divvi.getUnrigesteredProtocols(
				user.data.addresses[0]!.address,
			);

			// it was unchecked but it is already registered so just update the user
			if (unregisteredProtocols.length === 0) {
				console.log('user was unchecked but check confirmed he was already registered');
				await fetch('/api/users', {
					method: 'PATCH',
					body: encodeJson<PatchUsersBody>({
						divviRegistration: { status: 'was_already_registered' },
					}),
				});
				user.refetch();
				return;
			}

			// try to register user
			const registerTxHash = await divvi.sendRegistrationTransaction();
			if (!registerTxHash) {
				console.error("couldn't register tx");
				return;
			}
			console.log(123);

			// if transaction sent successfully then update the user
			await fetch('/api/users', {
				method: 'PATCH',
				body: encodeJson<PatchUsersBody>({
					divviRegistration: { status: 'transaction_submitted', hash: registerTxHash },
				}),
			});
			user.refetch();
		}

		console.log('ah?');
	});
}

const [account, setAccount] = createStore<UseAppKitAccountReturn>({
	allAccounts: [],
	caipAddress: undefined,
	address: undefined,
	isConnected: false,
	embeddedWalletInfo: undefined,
	status: 'disconnected',
});
export function useAppkitAccount() {
	return account;
}

export default function Game() {
	const logout = useLogout();
	const appkitAccount = useAppkitAccount();
	useGameServer();
	useGameTimer();
	useDivviSync();

	// createEffect(() => {
	// 	if (gameState.status !== 'in_progress' && gameState.status !== 'paused') return;

	// 	window.addEventListener('beforeunload', onBeforeUnload);
	// 	onCleanup(() => {
	// 		window.removeEventListener('beforeunload', onBeforeUnload);
	// 	});
	// });

	// createEffect(() => {
	// 	if (!appkitAccount.address) return;
	// 	bla();
	// });

	onMount(async () => {
		appkitModal.subscribeAccount((data) => {
			setAccount(data);
		});

		appkitModal.subscribeEvents((event) => {
			console.log(event);
			if (event.data.event === 'DISCONNECT_SUCCESS') {
				logout.mutate();
			}
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

	return (
		<div class="relative h-lvh w-full overflow-hidden">
			<Terrain />

			<Player />
			<Enemies />
			<Bullet />
			<Gems />

			{/* <Banner /> */}
			<UserAccount />
			<StageTimer />
			<UIStats />
		</div>
	);
}

function Terrain(props: ParentProps) {
	return (
		<div
			class="bg-forest"
			style={{
				'image-rendering': 'pixelated',
				transform: `translate3d(calc(-50% + ${worldRect().x}px), calc(-50% + ${worldRect().y}px), 0)`,
				width: `${WORLD_SIZE}px`,
				height: `${WORLD_SIZE}px`,
			}}
		>
			{props.children}
		</div>
	);
}
