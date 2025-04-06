import { Show, createEffect, onCleanup } from 'solid-js';
import Banner from '~/components/Banner';
import Enemies from '~/components/Enemies';
import FPSCounter from '~/components/FPSCounter';
import Gems from '~/components/Gems';
import Player from '~/components/Player';
import StageTimer, { setupGameTimer, stageTimer } from '~/components/StageTimer';
import Terrain from '~/components/Terrain';
import UIStats from '~/components/UIStats';
import Arrow from '~/components/weapons/Arrows';
import { DEBUG_MECHANICS } from '~/constants';
import { clearGameLoop, runGameLoop } from '~/gameLoop';
import { sendWS, setupGameServerConnection } from '~/lib/gameServer';
import { setupKeyboardEvents } from '~/lib/keyboardEvents';
import { gameState } from '~/state';

function onBeforeUnload(_e: BeforeUnloadEvent) {
  // e.preventDefault();
  // setGameState("status", "paused");
  // sendWS({ type: "pause_game", timePassedInMs: stageTimer() });
}

export default function Game() {
  setupGameServerConnection();
  setupGameTimer();
  setupKeyboardEvents();

  onCleanup(() => {
    clearGameLoop();
  });

  createEffect(() => {
    if (gameState.status === 'lost') {
      sendWS({ type: 'game_lost', timePassedInMs: stageTimer() });
      return;
    }

    if (gameState.status === 'in_progress' || DEBUG_MECHANICS) {
      runGameLoop();
      window.addEventListener('beforeunload', onBeforeUnload);
      onCleanup(() => {
        window.removeEventListener('beforeunload', onBeforeUnload);
      });
      return;
    }
  });

  return (
    <div class="relative h-lvh w-full overflow-hidden">
      <Terrain />

      <Enemies />
      <Player />
      <Arrow />
      <Gems />

      <Show when={!DEBUG_MECHANICS}>
        <Banner />
        <StageTimer />
        <UIStats />
      </Show>

      <FPSCounter />
    </div>
  );
}
