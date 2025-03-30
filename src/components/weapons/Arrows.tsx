import { For } from "solid-js";
import { relativePlayerPos } from "~/components/Player";
import { ARROW_DAMAGE, ARROW_DISTANCE, ARROW_SIZE } from "~/constants";
import { gameState, setGameState } from "~/state";
import { cn, getDiagonalDistance, getInitialRect } from "~/utils";

function getArrowDistance(direction: Arrow["direction"]) {
  if (direction === "north") return { x: 0, y: -ARROW_DISTANCE };
  if (direction === "south") return { x: 0, y: ARROW_DISTANCE };
  if (direction === "west") return { x: -ARROW_DISTANCE, y: 0 };
  if (direction === "east") return { x: ARROW_DISTANCE, y: 0 };
  if (direction === "north-west") {
    return { x: -getDiagonalDistance(ARROW_DISTANCE), y: -getDiagonalDistance(ARROW_DISTANCE) };
  }
  if (direction === "north-east") {
    return { x: getDiagonalDistance(ARROW_DISTANCE), y: -getDiagonalDistance(ARROW_DISTANCE) };
  }
  if (direction === "south-west") {
    return { x: -getDiagonalDistance(ARROW_DISTANCE), y: getDiagonalDistance(ARROW_DISTANCE) };
  }
  // south-east
  return { x: getDiagonalDistance(ARROW_DISTANCE), y: getDiagonalDistance(ARROW_DISTANCE) };
}

export function createSingleArrow(direction: Arrow["direction"]): Arrow {
  const arrowStartX = relativePlayerPos().centerX - ARROW_SIZE / 2;
  const arrowStartY = relativePlayerPos().centerY - ARROW_SIZE / 2;
  const rect = getInitialRect({
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    x: arrowStartX,
    y: arrowStartY,
  });
  return {
    ref: undefined,
    rect,
    direction,
    damage: ARROW_DAMAGE,
    target: {
      x: arrowStartX + getArrowDistance(direction).x,
      y: arrowStartY + getArrowDistance(direction).y,
    },
  };
}

export function spawnArrow(direction: Arrow["direction"]) {
  setGameState("arrows", gameState.arrows.length, createSingleArrow(direction));
}

export function destroyArrow(idx: number) {
  setGameState(
    "arrows",
    gameState.arrows.filter((_, i) => idx !== i)
  );
}

export default function Arrows() {
  return (
    <For each={gameState.arrows}>
      {(_, idx) => (
        <div
          ref={(el) => setGameState("arrows", idx(), "ref", el)}
          class="w-arrow-hitbox h-arrow-hitbox absolute overflow-hidden"
        >
          <div
            class={cn(
              "bg-arrow w-arrow h-arrow relative overflow-hidden bg-[position:0_calc(var(--pixel-size)_*_4px_*-1)] bg-no-repeat [image-rendering:pixelated]"
            )}
          />
        </div>
      )}
    </For>
  );
}
