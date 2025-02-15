import { createEffect, onCleanup, onMount, ParentProps } from 'solid-js';
import Banner from '~/components/Banner';
import Enemies from '~/components/Enemies';
import Player from '~/components/Player';
import StageTimer from '~/components/StageTimer';
import UIStats from '~/components/UIStats';
import UserAccount from '~/components/UserAccount';
import Bullet from '~/components/weapons/Bullets';
import { clearGameLoop, runGameLoop } from '~/gameLoop';
import {
	gameState,
	keyPressed,
	resetGameState,
	setGameState,
	setKeyPressed,
	setLastPressedCombination,
	worldPos,
} from '~/state';

function onKeyDown(e: KeyboardEvent) {
	if (e.code === 'Escape' || e.code === 'KeyP') {
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
	onMount(async () => {
		runGameLoop();

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
