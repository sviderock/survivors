import { createEffect, onCleanup } from "solid-js";
import Enemies from "~/components/Enemies";
import Gems from "~/components/Gems";
import Player from "~/components/Player";
import { setupGameTimer } from "~/components/StageTimer";
import Terrain from "~/components/Terrain";
import Arrow from "~/components/weapons/Arrows";
import { GAME_UPDATE_INTERVAL, PLAYER_NAME } from "~/constants";
import { clearGameLoop } from "~/gameLoop";
import { setupKeyboardEvents } from "~/lib/keyboardEvents";
import { trpc } from "~/lib/trpcClient";
import { gameState, playersWorldPos, setPlayersWorldPos, setWorldRect, worldRect } from "~/state";
import { getNewPos, lerp } from "~/utils";

let lastUpdateTime = performance.now();

function renderMovement() {
  let now = performance.now();
  let t = Math.min((now - lastUpdateTime) / GAME_UPDATE_INTERVAL, 1);
  setWorldRect(
    getNewPos({
      x: lerp(playersWorldPos.players[0]!.prev.x, playersWorldPos.players[0]!.next.x, t),
      y: lerp(playersWorldPos.players[0]!.prev.y, playersWorldPos.players[0]!.next.y, t),
      width: worldRect.width,
      height: worldRect.height,
    })
  );

  requestAnimationFrame(renderMovement);
}

export default function Game() {
  trpc.worldState.subscribe(
    { playerName: PLAYER_NAME },
    {
      async onStarted() {
        const initialPos = await trpc.player.initialPos.query({ playerName: PLAYER_NAME });
        setPlayersWorldPos("players", 0, { prev: initialPos, next: initialPos });
        renderMovement();
      },
      onData({ players }) {
        const player = players[PLAYER_NAME]!;
        setPlayersWorldPos("players", 0, (p) => ({ prev: p.next, next: player.pos }));
        lastUpdateTime = performance.now();
      },
    }
  );
  setupGameTimer();
  setupKeyboardEvents();

  onCleanup(() => {
    clearGameLoop();
  });

  createEffect(() => {
    if (gameState.status === "lost") {
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

      {/* <Show when={!DEBUG_MECHANICS}>
        <Banner />
        <StageTimer />
      </Show>
      <UIStats />
      <FPSCounter /> */}
    </div>
  );
}
