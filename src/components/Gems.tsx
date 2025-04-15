import { For, onMount } from "solid-js";
import { playerRect } from "~/components/Player";
import { GEM_HITBOX_SIZE, GEM_LIMIT } from "~/constants";
import { gameState, setGameState } from "~/state";
import { getInitialRect } from "~/utils";

type CreateGemProps = { x: number; y: number; value?: number };
function createGem({ x, y, value = 1 }: CreateGemProps): Gem {
  const rect = getInitialRect({ x, y, width: GEM_HITBOX_SIZE.w, height: GEM_HITBOX_SIZE.h });
  return { ref: undefined, rect, value, status: "not_picked_up" };
}

export function spawnGem(props: CreateGemProps) {
  const currentGemCount = gameState.gems.length;
  if (currentGemCount === GEM_LIMIT) return;
  setGameState("gems", currentGemCount, createGem(props));
}

export function destroyGem(idx: number) {
  setGameState(
    "gems",
    gameState.gems.filter((_, i) => idx !== i)
  );
}

export default function Gems() {
  onMount(() => {
    spawnGem({ x: playerRect().x - 300, y: playerRect().y - 300 });
  });
  return (
    <For each={gameState.gems}>
      {(_gem, idx) => (
        <span
          ref={(el) => setGameState("gems", idx(), "ref", el)}
          class="absolute h-(--gem-hitbox-height) w-(--gem-hitbox-width) animate-caret-blink rounded-xl border-2 border-cyan-600 bg-cyan-400"
        />
      )}
    </For>
  );
}
