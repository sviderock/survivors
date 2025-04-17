import { For } from "solid-js";
import { produce } from "solid-js/store";
import { GEM_HITBOX_SIZE, GEM_LIMIT } from "~/constants";
import { gameState, setGameState } from "~/state";
import { cn, getInitialRect } from "~/utils";

type CreateGemProps = { x: number; y: number; value?: number };
function createGem({ x, y, value = 1 }: CreateGemProps): Gem {
  const rect = getInitialRect({ x, y, width: GEM_HITBOX_SIZE.w, height: GEM_HITBOX_SIZE.h });
  return { ref: undefined, rect, value, status: "not_picked_up", level: 1 };
}

export function spawnGem(props: CreateGemProps) {
  const currentGemCount = gameState.gems.length;
  if (currentGemCount === GEM_LIMIT) {
    setGameState(
      "gems",
      currentGemCount - 1,
      produce((gem) => {
        gem.value++;
        gem.level = gem.value < 3 ? 1 : gem.value < 9 ? 2 : 3;
      })
    );
    return;
  }

  setGameState("gems", currentGemCount, createGem(props));
}

export function destroyGem(idx: number) {
  setGameState(
    "gems",
    gameState.gems.filter((_, i) => idx !== i)
  );
}

export default function Gems() {
  return (
    <For each={gameState.gems}>
      {(gem, idx) => (
        <span
          ref={(el) => setGameState("gems", idx(), "ref", el)}
          class={cn(
            "absolute h-(--gem-hitbox-height) w-(--gem-hitbox-width) animate-caret-blink rounded-xl border-2 ",
            gem.level === 1 && "border-cyan-600 bg-cyan-400",
            gem.level === 2 && "border-emerald-600 bg-emerald-400",
            gem.level === 3 && "border-rose-600 bg-rose-400"
          )}
        />
      )}
    </For>
  );
}
