import { For } from 'solid-js';
import { relativePlayerPos } from '~/components/Player';
import {
  ARROW_ACTUAL_SPRITE_SIZE,
  ARROW_DAMAGE,
  ARROW_DISTANCE,
  ARROW_HITBOX_SIZE,
  ARROW_SPRITE_SIZE,
} from '~/constants';
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
  const arrowStartY =
    relativePlayerPos().centerY + ARROW_SPRITE_SIZE.h / 2 + ARROW_ACTUAL_SPRITE_SIZE.h / 2;
  const rect = getInitialRect({
    x: arrowStartX,
    y: arrowStartY,
    width: ARROW_ACTUAL_SPRITE_SIZE.w,
    height: ARROW_ACTUAL_SPRITE_SIZE.h,
  });
  const hitboxTopLeft = calculateRotatedPosition({
    angle: getRotationDeg(direction),
    startOffsetX: arrowStartX,
    startOffsetY: arrowStartY,
    modelSize: ARROW_ACTUAL_SPRITE_SIZE,
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
              class="absolute box-content h-(--arrow-actual-sprite-height) w-(--arrow-actual-sprite-width) border-yellow-500 border-none"
            >
              <div
                class={cn(
                  'bg-(image:--arrow-sprite) -translate-y-1/2 relative top-1 box-content h-(--arrow-sprite-height) w-(--arrow-sprite-width) border-blue-500 border-none bg-[position:-1px_0] bg-no-repeat [image-rendering:pixelated]',
                )}
              />
            </div>

            <span
              ref={(el) => setGameState('arrows', idx(), 'hitboxRef', el)}
              // class="absolute z-10 h-(--arrow-hitbox-height) w-(--arrow-hitbox-width) bg-purple-500/80 "
            />
          </>
        )}
      </For>
    </>
  );
}
