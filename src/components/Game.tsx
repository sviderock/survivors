import { Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import Banner from "~/components/Banner";
import Enemies from "~/components/Enemies";
import FPSCounter from "~/components/FPSCounter";
import Gems from "~/components/Gems";
import Player from "~/components/Player";
import StageTimer, { setupGameTimer, stageTimer } from "~/components/StageTimer";
import Terrain from "~/components/Terrain";
import UIStats from "~/components/UIStats";
import Arrow from "~/components/weapons/Arrows";
import { DEBUG_MECHANICS } from "~/constants";
import { clearGameLoop, runGameLoop } from "~/gameLoop";
import { sendWS } from "~/lib/gameServer";
import { setupKeyboardEvents } from "~/lib/keyboardEvents";
import { trpc } from "~/lib/trpcClient";
import { gameState, setWorldRect, worldRect } from "~/state";
import { getNewPos, lerp } from "~/utils";

let lastUpdateTime = performance.now();
const [pos, setPos] = createSignal({
  prev: { x: 0, y: 0 },
  next: { x: 0, y: 0 },
});

function onBeforeUnload(_e: BeforeUnloadEvent) {
  // e.preventDefault();
  // setGameState("status", "paused");
  // sendWS({ type: "pause_game", timePassedInMs: stageTimer() });
}

function renderMovement() {
  let now = performance.now();
  let t = Math.min((now - lastUpdateTime) / 100, 1);
  console.log(t);
  setWorldRect(
    getNewPos({
      x: lerp(pos().prev.x, pos().next.x, t),
      y: lerp(pos().prev.y, pos().next.y, t),
      width: worldRect.width,
      height: worldRect.height,
    })
  );

  requestAnimationFrame(renderMovement);
}

export default function Game() {
  trpc.worldState.subscribe(void 0, {
    onData: ({ players }) => {
      const player = players[0]!;
      setPos((p) => ({ prev: p.next, next: player.pos }));
      lastUpdateTime = performance.now();
    },
  });
  // setupGameServerConnection();
  setupGameTimer();
  setupKeyboardEvents();

  onMount(() => {
    renderMovement();
  });

  createEffect(() => {
    console.log(worldRect.x, worldRect.y);
  });

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
      window.addEventListener("beforeunload", onBeforeUnload);
      onCleanup(() => {
        window.removeEventListener("beforeunload", onBeforeUnload);
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
      </Show>
      <UIStats />

      <FPSCounter />
    </div>
  );
}
