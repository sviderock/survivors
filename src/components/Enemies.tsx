import { For, onCleanup, onMount } from 'solid-js';
import { relativePlayerPos } from '~/components/Player';
import { ENEMY_SIZE } from '~/constants';
import { createSingleEnemy, enemies, setEnemies } from '~/state';
import { getRect } from '~/utils';

const enemyRefs: HTMLSpanElement[] = [];

export default function Enemies() {
	let enemiesInterval: NodeJS.Timeout;

	onMount(() => {
		enemies().forEach(([, setEnemy], idx) => {
			const rect = getRect(enemyRefs[idx]);
			setEnemy(rect);
		});

		enemiesInterval = setInterval(() => {
			setEnemies((prev) => [
				...prev,
				createSingleEnemy({
					x:
						Math.random() > 0.5
							? relativePlayerPos().centerX + Math.floor(Math.random() * 500 + 500)
							: relativePlayerPos().centerX - Math.floor(Math.random() * 500 + 500),
					y:
						Math.random() > 0.5
							? relativePlayerPos().centerY + Math.floor(Math.random() * 500 + 500)
							: relativePlayerPos().centerY - Math.floor(Math.random() * 500 + 500),
				}),
			]);
		}, 500);

		onCleanup(() => {
			clearInterval(enemiesInterval);
		});
	});

	return (
		<For each={enemies()}>
			{([enemy], idx) => (
				<span
					ref={enemyRefs[idx()]}
					class="absolute border-2 border-blue-900 bg-blue-500"
					style={{
						transform: `translate3d(${enemy().x}px, ${enemy().y}px, 0)`,
						width: `${ENEMY_SIZE}px`,
						height: `${ENEMY_SIZE}px`,
					}}
				/>
			)}
		</For>
	);
}
