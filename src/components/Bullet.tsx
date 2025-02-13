import { createSignal, onCleanup, onMount } from 'solid-js';
import { playerPos, relativePlayerPos } from '~/components/Player';
import { BULLET_DISTANCE } from '~/constants';
import { lastPressedCombination } from '~/state';
import {
	cn,
	getDiagonalDistance,
	getInitialRect,
	getNewPos,
	getRect,
	type GetRotationDeg,
	getRotationDeg,
} from '~/utils';

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

export function resetBullet() {
	setBulletPos((pos) => ({
		...pos,
		...getNewPos({
			x: relativePlayerPos().centerX - pos.width / 2,
			y: relativePlayerPos().centerY - pos.height / 2,
			width: pos.width,
			height: pos.height,
		}),
		firedAt: null,
	}));
}

export const [bulletPos, setBulletPos] = createSignal({
	...getInitialRect({ x: 0, y: 0 }),
	rotation: getRotationDeg('w') as GetRotationDeg,
	firedAt: null as { x: number; y: number } | null,
});

export default function Bullet() {
	let ref: HTMLDivElement;
	let firingBulletInterval: NodeJS.Timeout;

	onMount(() => {
		const bulletRect = getRect(ref!);
		const bulletStartX = playerPos().centerX - bulletRect.width / 2;
		const bulletStartY = playerPos().centerY - bulletRect.height / 2;
		setBulletPos((pos) => ({
			...pos,
			...getNewPos({
				x: bulletStartX,
				y: bulletStartY,
				width: bulletRect.width,
				height: bulletRect.height,
			}),
		}));

		firingBulletInterval = setInterval(() => {
			const bulletRect = getRect(ref!);
			const bulletStartX = relativePlayerPos().centerX - bulletRect.width / 2;
			const bulletStartY = relativePlayerPos().centerY - bulletRect.height / 2;
			setBulletPos((pos) => ({
				...pos,
				...getNewPos({
					x: bulletStartX,
					y: bulletStartY,
					width: bulletRect.width,
					height: bulletRect.height,
				}),
				rotation: getRotationDeg(lastPressedCombination()),
				firedAt: {
					x: relativePlayerPos().centerX + getBulletDistance().x,
					y: relativePlayerPos().centerY + getBulletDistance().y,
				},
			}));
		}, 1000);
	});

	onCleanup(() => {
		clearInterval(firingBulletInterval);
	});

	return (
		<span
			ref={ref!}
			class={cn('absolute flex h-8 w-2 bg-purple-700', !bulletPos().firedAt && 'opacity-0')}
			style={{
				'transform-origin': 'center center',
				transform: `translate3d(${bulletPos().x}px, ${bulletPos().y}px, 0) rotate(${bulletPos().rotation}deg)`,
			}}
		/>
	);
}
