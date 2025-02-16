import { createSignal, For, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { relativePlayerPos } from '~/components/Player';
import { ENEMY_SIZE } from '~/constants';
import { getInitialRect, getRandomBetween, getRect } from '~/utils';

export const [enemies, setEnemies] = createStore<Enemy[]>([]);

function createSingleEnemy(): Enemy {
	const initialRect = getInitialRect({
		width: ENEMY_SIZE,
		height: ENEMY_SIZE,
		x: relativePlayerPos().centerX + getRandomBetween(500, 1500, true),
		y: relativePlayerPos().centerY + getRandomBetween(500, 1500, true),
	});
	const [rect, setRect] = createSignal(initialRect);
	return { ref: undefined, rect, setRect };
}

export function spawnEnemy() {
	setEnemies(produce((enemies) => enemies.push(createSingleEnemy())));
}

export function destroyEnemy(idx: number) {
	setEnemies((prev) => prev.filter((_, i) => idx !== i));
}

export default function Enemies() {
	onMount(() => {
		enemies.forEach((enemy) => {
			const rect = getRect(enemy.ref!);
			enemy.setRect(rect);
		});
	});

	return (
		<For each={enemies}>
			{(enemy, idx) => (
				<span
					ref={(el) => setEnemies(idx(), 'ref', el)}
					class="absolute border-2 border-blue-900 bg-blue-500"
					style={{
						transform: `translate3d(${enemy.rect().x}px, ${enemy.rect().y}px, 0)`,
						width: `${ENEMY_SIZE}px`,
						height: `${ENEMY_SIZE}px`,
					}}
				/>
			)}
		</For>
	);
}
