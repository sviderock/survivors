import { createEffect, onCleanup, onMount, ParentProps } from 'solid-js';
import { appkitModal } from '~/appkit';
import Banner from '~/components/Banner';
import Enemies from '~/components/Enemies';
import Gems from '~/components/Gems';
import Player, { playerLevel } from '~/components/Player';
import StageTimer from '~/components/StageTimer';
import UIStats from '~/components/UIStats';
import UserAccount, { useUser } from '~/components/UserAccount';
import Bullet from '~/components/weapons/Bullets';
import { clearGameLoop, runGameLoop } from '~/gameLoop';
import {
	gameState,
	keyPressed,
	resetGameState,
	setConnectedUser,
	setGameState,
	setKeyPressed,
	setLastPressedCombination,
	stageTimer,
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

function onBeforeUnload(e: BeforeUnloadEvent) {
	e.preventDefault();
	setGameState('status', 'paused');
	gameServer!.send(
		encodeJson<PauseGameEvent>({ type: 'pause_game', timePassedInMs: stageTimer() }),
	);
}

export default function Game() {
	useGameServer();

	createEffect(() => {
		console.log(gameState.status);
	});

	createEffect(() => {
		if (gameState.status !== 'in_progress' && gameState.status !== 'paused') return;

		window.addEventListener('beforeunload', onBeforeUnload);
		onCleanup(() => {
			window.removeEventListener('beforeunload', onBeforeUnload);
		});
	});

	onMount(async () => {
		appkitModal.subscribeAccount(setConnectedUser);

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		onCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
			clearGameLoop();
		});
	});

	createEffect(() => {
		if (gameState.status === 'in_progress') {
			runGameLoop();
		}
	});

	createEffect(() => {
		if (keyPressed.w && keyPressed.a) return setLastPressedCombination('wa');
		if (keyPressed.w && keyPressed.d) return setLastPressedCombination('wd');
		if (keyPressed.s && keyPressed.a) return setLastPressedCombination('sa');
		if (keyPressed.s && keyPressed.d) return setLastPressedCombination('sd');
		if (keyPressed.w) return setLastPressedCombination('w');
		if (keyPressed.s) return setLastPressedCombination('s');
		if (keyPressed.a) return setLastPressedCombination('a');
		if (keyPressed.d) return setLastPressedCombination('d');
	});

	return (
		<div class="relative h-lvh w-full overflow-hidden">
			<GameWorld>
				<Enemies />
				<Bullet />
				<Gems />
			</GameWorld>

			<Player />
			<Banner />
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
