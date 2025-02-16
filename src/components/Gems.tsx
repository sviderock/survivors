import { createSignal, For, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { GEM_SIZE } from '~/constants';
import { getInitialRect, getRect } from '~/utils';

export const [gems, setGems] = createStore<Gem[]>([]);

type CreateGemProps = { x: number; y: number; value?: number };
function createGem({ x, y, value = 1 }: CreateGemProps): Gem {
	const initialRect = getInitialRect({ x, y, width: GEM_SIZE.w, height: GEM_SIZE.h });
	const [rect, setRect] = createSignal(initialRect);
	return { ref: undefined, rect, setRect, value };
}

export function spawnGem(props: CreateGemProps) {
	setGems(produce((gems) => gems.push(createGem(props))));
}

export function destroyGem(idx: number) {
	setGems((prev) => prev.filter((_, i) => idx !== i));
}

export default function Gems() {
	onMount(() => {
		gems.forEach((gem) => {
			const rect = getRect(gem.ref!);
			gem.setRect(rect);
		});
	});

	return (
		<For each={gems}>
			{(gem, idx) => (
				<span
					ref={(el) => setGems(idx(), 'ref', el)}
					class="absolute animate-caret-blink rounded-xl border-2 border-cyan-600 bg-cyan-400"
					style={{
						transform: `translate3d(${gem.rect().x}px, ${gem.rect().y}px, 0)`,
						width: `${GEM_SIZE.w}px`,
						height: `${GEM_SIZE.h}px`,
					}}
				/>
			)}
		</For>
	);
}
