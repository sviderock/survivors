import { createEffect, onCleanup, onMount } from 'solid-js';
import Banner from '~/components/Banner';
import GameField from '~/components/GameField';
import Player from '~/components/Player';
import UIStats from '~/components/UIStats';
import UserAccount from '~/components/UserAccount';
import { runGameLoop } from '~/gameLoop';
import { keyPressed, setKeyPressed, setLastPressedCombination } from '~/state';

function onKeyDown(e: KeyboardEvent) {
	if (e.key === 'w') return setKeyPressed('w', true);
	if (e.key === 's') return setKeyPressed('s', true);
	if (e.key === 'a') return setKeyPressed('a', true);
	if (e.key === 'd') return setKeyPressed('d', true);
}

function onKeyUp(e: KeyboardEvent) {
	if (e.key === 'w') return setKeyPressed('w', false);
	if (e.key === 's') return setKeyPressed('s', false);
	if (e.key === 'a') return setKeyPressed('a', false);
	if (e.key === 'd') return setKeyPressed('d', false);
}

export default function Game() {
	let worldRef: HTMLDivElement;

	onMount(() => {
		runGameLoop();

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		onCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
		});
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
		</div>
	);
}
