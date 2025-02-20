import { For } from 'solid-js';
import { relativePlayerPos } from '~/components/Player';
import { BULLET_DAMAGE, BULLET_DISTANCE, BULLET_SIZE } from '~/constants';
import { gameState, setGameState } from '~/state';
import { cn, getDiagonalDistance, getInitialRect } from '~/utils';

function getBulletDistance(direction: Bullet['direction']) {
	if (direction === 'north') return { x: 0, y: -BULLET_DISTANCE };
	if (direction === 'south') return { x: 0, y: BULLET_DISTANCE };
	if (direction === 'west') return { x: -BULLET_DISTANCE, y: 0 };
	if (direction === 'east') return { x: BULLET_DISTANCE, y: 0 };
	if (direction === 'north-west') {
		return { x: -getDiagonalDistance(BULLET_DISTANCE), y: -getDiagonalDistance(BULLET_DISTANCE) };
	}
	if (direction === 'north-east') {
		return { x: getDiagonalDistance(BULLET_DISTANCE), y: -getDiagonalDistance(BULLET_DISTANCE) };
	}
	if (direction === 'south-west') {
		return { x: -getDiagonalDistance(BULLET_DISTANCE), y: getDiagonalDistance(BULLET_DISTANCE) };
	}
	// south-east
	return { x: getDiagonalDistance(BULLET_DISTANCE), y: getDiagonalDistance(BULLET_DISTANCE) };
}

export function createSingleBullet(direction: Bullet['direction']): Bullet {
	const bulletStartX = relativePlayerPos().centerX - BULLET_SIZE / 2;
	const bulletStartY = relativePlayerPos().centerY - BULLET_SIZE / 2;
	const rect = getInitialRect({
		width: BULLET_SIZE,
		height: BULLET_SIZE,
		x: bulletStartX,
		y: bulletStartY,
	});
	return {
		ref: undefined,
		rect,
		direction,
		damage: BULLET_DAMAGE,
		target: {
			x: bulletStartX + getBulletDistance(direction).x,
			y: bulletStartY + getBulletDistance(direction).y,
		},
	};
}

export function spawnBullet(direction: Bullet['direction']) {
	setGameState('bullets', gameState.bullets.length, createSingleBullet(direction));
}

export function destroyBullet(idx: number) {
	setGameState(
		'bullets',
		gameState.bullets.filter((_, i) => idx !== i),
	);
}

export default function Bullets() {
	return (
		<For each={gameState.bullets}>
			{(_, idx) => (
				<div
					ref={(el) => setGameState('bullets', idx(), 'ref', el)}
					class="w-bullet-hitbox h-bullet-hitbox absolute overflow-hidden"
				>
					<div
						class={cn(
							'bg-bullet w-bullet h-bullet relative overflow-hidden bg-[position:0_calc(var(--pixel-size)_*_4px_*-1)] bg-no-repeat [image-rendering:pixelated]',
						)}
					/>
				</div>
			)}
		</For>
	);
}
