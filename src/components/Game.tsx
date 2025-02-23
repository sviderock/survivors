import { createEffect, onCleanup } from 'solid-js';
import Banner from '~/components/Banner';
import Enemies from '~/components/Enemies';
import Gems from '~/components/Gems';
import Player from '~/components/Player';
import StageTimer, { setupGameTimer, stageTimer } from '~/components/StageTimer';
import Terrain from '~/components/Terrain';
import UIStats from '~/components/UIStats';
import UserAccount from '~/components/UserAccount';
import Bullet from '~/components/weapons/Bullets';
import { clearGameLoop, runGameLoop } from '~/gameLoop';
import { setupUserSync } from '~/lib/currentUser';
import { sendWS, setupGameServerConnection } from '~/lib/gameServer';
import { setupKeyboardEvents } from '~/lib/keyboardEvents';
import { gameState, setGameState } from '~/state';

function onBeforeUnload(e: BeforeUnloadEvent) {
	e.preventDefault();
	setGameState('status', 'paused');
	sendWS({ type: 'pause_game', timePassedInMs: stageTimer() });
}

export default function Game() {
	setupGameServerConnection();
	setupGameTimer();
	setupKeyboardEvents();
	setupUserSync();

	createEffect(() => {
		if (gameState.status === 'lost') {
			sendWS({ type: 'game_lost', timePassedInMs: stageTimer() });
			return;
		}

		if (gameState.status === 'in_progress') {
			runGameLoop();
			window.addEventListener('beforeunload', onBeforeUnload);
			onCleanup(() => {
				window.removeEventListener('beforeunload', onBeforeUnload);
			});
			return;
		}
	});

	onCleanup(() => {
		clearGameLoop();
	});

	return (
		<div class="relative h-lvh w-full overflow-hidden">
			<Terrain />

			<Player />
			<Enemies />
			<Bullet />
			<Gems />

			<Banner />
			<UserAccount />
			<StageTimer />
			<UIStats />
		</div>
	);
}
