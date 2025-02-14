import { createEffect, onCleanup, onMount } from 'solid-js';
import Banner from '~/components/Banner';
import GameField from '~/components/GameField';
import Player from '~/components/Player';
import StageTimer from '~/components/StageTimer';
import UIStats from '~/components/UIStats';
import UserAccount from '~/components/UserAccount';
import { runGameLoop } from '~/gameLoop';
import {
	gameState,
	keyPressed,
	resetGameState,
	setGameState,
	setKeyPressed,
	setLastPressedCombination,
} from '~/state';

function onKeyDown(e: KeyboardEvent) {
	if (e.code === 'Escape') {
		setGameState('status', (status) => {
			if (status === 'paused') return 'in_progress';
			if (status === 'in_progress') return 'paused';
			return status;
		});
		return;
	}

	if (e.code === 'Space') {
		setGameState('status', (status) => {
			if (status === 'not_started') return 'in_progress';
			return status;
		});

		return;
	}

	if (e.code === 'KeyR') {
		return resetGameState();
	}

	if (gameState.status === 'in_progress') {
		if (e.code === 'KeyW') return setKeyPressed('w', true);
		if (e.code === 'KeyS') return setKeyPressed('s', true);
		if (e.code === 'KeyA') return setKeyPressed('a', true);
		if (e.code === 'KeyD') return setKeyPressed('d', true);
	}
}

function onKeyUp(e: KeyboardEvent) {
	if (gameState.status === 'in_progress') {
		if (e.code === 'KeyW') return setKeyPressed('w', false);
		if (e.code === 'KeyS') return setKeyPressed('s', false);
		if (e.code === 'KeyA') return setKeyPressed('a', false);
		if (e.code === 'KeyD') return setKeyPressed('d', false);
	}
}

export default function Game() {
	let worldRef: HTMLDivElement;

	onMount(async () => {
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);

		onCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
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
		<div class="relative h-lvh w-full overflow-hidden" ref={worldRef!}>
			<GameField />
			<UIStats />
			<Player />
			<Banner />
			<UserAccount />
			<StageTimer />
		</div>
	);
}
