import { For, onMount } from 'solid-js';
import { relativePlayerPos } from '~/components/Player';
import { ENEMY_SIZE } from '~/constants';
import { enemies, setEnemies } from '~/state';
import { getRandomBetween, getRect } from '~/utils';

export function getNewEnemyPos() {
	return {
		x:
			Math.random() > 0.5
				? relativePlayerPos().centerX + getRandomBetween(500, 1500)
				: relativePlayerPos().centerX - getRandomBetween(500, 1500),
		y:
			Math.random() > 0.5
				? relativePlayerPos().centerY + getRandomBetween(500, 1500)
				: relativePlayerPos().centerY - getRandomBetween(500, 1500),
	};
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
