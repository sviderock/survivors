import { For } from 'solid-js';
import { GEM_HITBOX_SIZE } from '~/constants';
import { gameState, setGameState } from '~/state';
import { getInitialRect } from '~/utils';

type CreateGemProps = { x: number; y: number; value?: number };
function createGem({ x, y, value = 1 }: CreateGemProps): Gem {
  const rect = getInitialRect({ x, y, width: GEM_HITBOX_SIZE.w, height: GEM_HITBOX_SIZE.h });
  return { ref: undefined, rect, value };
}

export function spawnGem(props: CreateGemProps) {
  setGameState('gems', gameState.gems.length, createGem(props));
}

export function destroyGem(idx: number) {
  setGameState(
    'gems',
    gameState.gems.filter((_, i) => idx !== i),
  );
}

export default function Gems() {
  return (
    <For each={gameState.gems}>
      {(_gem, idx) => (
        <span
          ref={(el) => setGameState('gems', idx(), 'ref', el)}
          class="absolute h-(--gem-hitbox-height) w-(--gem-hitbox-width) animate-caret-blink rounded-xl border-2 border-cyan-600 bg-cyan-400"
        />
      )}
    </For>
  );
}
