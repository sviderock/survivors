import { createSignal, For, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { relativePlayerPos } from '~/components/Player';
import { BULLET_DISTANCE, BULLET_SIZE } from '~/constants';
import { lastPressedCombination } from '~/state';
import { getDiagonalDistance, getInitialRect, getRect } from '~/utils';

export const [bullets, setBullets] = createStore<Bullet[]>([]);

function getBulletDistance() {
	if (lastPressedCombination() === 'w') return { x: 0, y: -BULLET_DISTANCE };
	if (lastPressedCombination() === 's') return { x: 0, y: BULLET_DISTANCE };
	if (lastPressedCombination() === 'a') return { x: -BULLET_DISTANCE, y: 0 };
	if (lastPressedCombination() === 'd') return { x: BULLET_DISTANCE, y: 0 };
	if (lastPressedCombination() === 'wa') {
		return { x: -getDiagonalDistance(BULLET_DISTANCE), y: -getDiagonalDistance(BULLET_DISTANCE) };
	}
	if (lastPressedCombination() === 'wd') {
		return { x: getDiagonalDistance(BULLET_DISTANCE), y: -getDiagonalDistance(BULLET_DISTANCE) };
	}
	if (lastPressedCombination() === 'sa') {
		return { x: -getDiagonalDistance(BULLET_DISTANCE), y: getDiagonalDistance(BULLET_DISTANCE) };
	}
	// sd
	return { x: getDiagonalDistance(BULLET_DISTANCE), y: getDiagonalDistance(BULLET_DISTANCE) };
}

export function createSingleBullet(): Bullet {
	const bulletStartX = relativePlayerPos().centerX - BULLET_SIZE / 2;
	const bulletStartY = relativePlayerPos().centerY - BULLET_SIZE / 2;
	const initialRect = getInitialRect({
		width: BULLET_SIZE,
		height: BULLET_SIZE,
		x: bulletStartX,
		y: bulletStartY,
	});
	const [rect, setRect] = createSignal(initialRect);
	return {
		ref: undefined,
		rect,
		setRect,
		target: {
			x: bulletStartX + getBulletDistance().x,
			y: bulletStartY + getBulletDistance().y,
		},
	};
}

export function spawnBullet() {
	setBullets(produce((bullets) => bullets.push(createSingleBullet())));
}

export function destroyBullet(idx: number) {
	setBullets((prev) => prev.filter((_, i) => idx !== i));
}

export default function Bullets() {
	onMount(() => {
		bullets.forEach((bullet) => {
			const rect = getRect(bullet.ref!);
			bullet.setRect(rect);
		});
	});

	return (
		<For each={bullets}>
			{(bullet, idx) => (
				<span
					ref={(el) => setBullets(idx(), 'ref', el)}
					class="absolute z-[20] flex bg-purple-700"
					style={{
						transform: `translate3d(${bullet.rect().x}px, ${bullet.rect().y}px, 0)`,
						width: `${bullet.rect().width}px`,
						height: `${bullet.rect().height}px`,
					}}
				/>
			)}
		</For>
	);
}
