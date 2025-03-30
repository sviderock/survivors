import { createEffect, onCleanup, Show } from "solid-js";
import Banner from "~/components/Banner";
import Enemies from "~/components/Enemies";
import Gems from "~/components/Gems";
import Player from "~/components/Player";
import StageTimer, { setupGameTimer, stageTimer } from "~/components/StageTimer";
import Terrain from "~/components/Terrain";
import UIStats from "~/components/UIStats";
import UserAccount from "~/components/UserAccount";
import Arrow from "~/components/weapons/Arrows";
import { DEBUG_MECHANICS } from "~/constants";
import { clearGameLoop, runGameLoop } from "~/gameLoop";
import { setupUserSync } from "~/lib/currentUser";
import { sendWS, setupGameServerConnection } from "~/lib/gameServer";
import { setupKeyboardEvents } from "~/lib/keyboardEvents";
import { gameState, setGameState } from "~/state";

function onBeforeUnload(e: BeforeUnloadEvent) {
  e.preventDefault();
  setGameState("status", "paused");
  sendWS({ type: "pause_game", timePassedInMs: stageTimer() });
}

export default function Game() {
  setupGameServerConnection();
  setupGameTimer();
  setupKeyboardEvents();
  setupUserSync();

  onCleanup(() => {
    clearGameLoop();
  });

  createEffect(() => {
    if (gameState.status === "lost") {
      sendWS({ type: "game_lost", timePassedInMs: stageTimer() });
      return;
    }

    if (gameState.status === "in_progress" || DEBUG_MECHANICS) {
      runGameLoop();
      // window.addEventListener('beforeunload', onBeforeUnload);
      // onCleanup(() => {
      // 	window.removeEventListener('beforeunload', onBeforeUnload);
      // });
      return;
    }
  });

  return (
    <div class="relative h-lvh w-full overflow-hidden">
      <Terrain />

      <Player />
      <Enemies />
      <Arrow />
      <Gems />

      <Show when={!DEBUG_MECHANICS}>
        <Banner />
        <UserAccount />
        <StageTimer />
        <UIStats />
      </Show>
    </div>
  );
}
