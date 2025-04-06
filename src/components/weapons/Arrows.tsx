import { For } from 'solid-js';
import { relativePlayerPos } from '~/components/Player';
import { ARROW_DAMAGE, ARROW_DISTANCE, ARROW_HITBOX_SIZE, ARROW_MODEL_SIZE } from '~/constants';
import { gameState, setGameState } from '~/state';
import {
  calculateRotatedPosition,
  cn,
  getDiagonalDistance,
  getInitialRect,
  getRotationDeg,
} from '~/utils';

function getArrowDistance(direction: Arrow['direction']) {
  if (direction === 'north') return { x: 0, y: -ARROW_DISTANCE };
  if (direction === 'south') return { x: 0, y: ARROW_DISTANCE };
  if (direction === 'west') return { x: -ARROW_DISTANCE, y: 0 };
  if (direction === 'east') return { x: ARROW_DISTANCE, y: 0 };
  if (direction === 'north-west') {
    return { x: -getDiagonalDistance(ARROW_DISTANCE), y: -getDiagonalDistance(ARROW_DISTANCE) };
  }
  if (direction === 'north-east') {
    return { x: getDiagonalDistance(ARROW_DISTANCE), y: -getDiagonalDistance(ARROW_DISTANCE) };
  }
  if (direction === 'south-west') {
    return { x: -getDiagonalDistance(ARROW_DISTANCE), y: getDiagonalDistance(ARROW_DISTANCE) };
  }
  // south-east
  return { x: getDiagonalDistance(ARROW_DISTANCE), y: getDiagonalDistance(ARROW_DISTANCE) };
}

export function createSingleArrow(direction: Arrow['direction']): Arrow {
  const arrowStartX = relativePlayerPos().centerX;
  const arrowStartY = relativePlayerPos().centerY + ARROW_MODEL_SIZE.h * 1.5;
  const rect = getInitialRect({
    x: arrowStartX,
    y: arrowStartY,
    width: ARROW_MODEL_SIZE.w,
    height: ARROW_MODEL_SIZE.h,
  });
  const hitboxTopLeft = calculateRotatedPosition({
    angle: getRotationDeg(direction),
    startOffsetX: arrowStartX,
    startOffsetY: arrowStartY,
    modelSize: ARROW_MODEL_SIZE,
    hitboxSize: ARROW_HITBOX_SIZE,
    shiftHitbox: true,
  });
  const hitboxRect = getInitialRect({
    ...hitboxTopLeft,
    width: ARROW_HITBOX_SIZE.w,
    height: ARROW_HITBOX_SIZE.h,
  });

  return {
    ref: undefined,
    hitboxRef: undefined,
    rect,
    direction,
    hitbox: hitboxRect,
    damage: ARROW_DAMAGE,
    target: {
      x: arrowStartX + getArrowDistance(direction).x,
      y: arrowStartY + getArrowDistance(direction).y,
    },
  };
}

export function spawnArrow(direction: Arrow['direction']) {
  setGameState('arrows', gameState.arrows.length, createSingleArrow(direction));
}

export function destroyArrow(idx: number) {
  setGameState(
    'arrows',
    gameState.arrows.filter((_, i) => idx !== i),
  );
}

export default function Arrows() {
  return (
    <>
      <For each={gameState.arrows}>
        {(_arrow, idx) => (
          <>
            <div
              ref={(el) => setGameState('arrows', idx(), 'ref', el)}
              class="absolute box-content h-arrow-model w-arrow-model border-yellow-500 border-none"
            >
              <div
                class={cn(
                  'relative box-content h-arrow w-arrow border-blue-500 border-none bg-[position:-1px_-28px] bg-arrow bg-no-repeat [image-rendering:pixelated]',
                )}
              />
            </div>

            <span
              ref={(el) => setGameState('arrows', idx(), 'hitboxRef', el)}
              // class="bg-purple-500/80 w-arrow-hitbox h-arrow-hitbox absolute z-10 "
            />
          </>
        )}
      </For>
    </>
  );
}
