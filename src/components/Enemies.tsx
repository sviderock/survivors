import { createEffect, For } from 'solid-js';
import { relativePlayerPos } from '~/components/Player';
import {
	ENEMY_ATTACK_COOLDOWN,
	ENEMY_BASE_HEALTH,
	ENEMY_COLLISION_OFFSET,
	ENEMY_SIZE,
} from '~/constants';
import { gameState, setGameState } from '~/state';
import { cn, getInitialRect, getRandomBetween } from '~/utils';

function createSingleEnemy(): Enemy {
	const health = getRandomBetween(1, ENEMY_BASE_HEALTH) + 10;
	return {
		ref: undefined,
		attack: 3,
		attackStatus: 'ready',
		health,
		maxHealth: health,
		blocked: { x: 0, y: 0 },
		status: 'idle',
		dirX: 0,
		dirY: 0,
		rect: getInitialRect({
			width: ENEMY_SIZE,
			height: ENEMY_SIZE,
			// x: relativePlayerPos().centerX + getRandomBetween(500, 1000, true),
			// y: relativePlayerPos().centerY + getRandomBetween(500, 1000, true),
			x: relativePlayerPos().centerX + 300 + getRandomBetween(10, 30),
			y: relativePlayerPos().centerY + 0,
		}),
	};
}

export function spawnEnemy() {
	setGameState('enemies', gameState.enemies.length, createSingleEnemy());
}

export function destroyEnemy(idx: number) {
	setGameState(
		'enemies',
		gameState.enemies.filter((_, i) => idx !== i),
	);
}

export function slowCollisionDetect(enemy: Enemy) {
	const blocked: Enemy['blocked'] = { x: 0, y: 0 };
	for (let j = 0; j < gameState.enemies.length; j++) {
		const foreignEnemy = gameState.enemies[j]!;
		if (enemy === foreignEnemy) continue;
		if (blocked.x !== 0 && blocked.y !== 0) break;

		if (blocked.x === 0) {
			const blockedRight =
				enemy.dirX === 1 && enemy.rect.right + ENEMY_COLLISION_OFFSET >= foreignEnemy.rect.left;
			const blockedLeft =
				enemy.dirX === -1 && enemy.rect.left - ENEMY_COLLISION_OFFSET <= foreignEnemy.rect.right;
			blocked.x = blockedRight ? 1 : blockedLeft ? -1 : 0;
		}

		if (blocked.y === 0) {
			const blockedBottom =
				enemy.dirY === 1 && enemy.rect.bottom + ENEMY_COLLISION_OFFSET === foreignEnemy.rect.top;
			const blockedTop =
				enemy.dirY === -1 && enemy.rect.top - ENEMY_COLLISION_OFFSET === foreignEnemy.rect.bottom;
			blocked.y = blockedBottom ? 1 : blockedTop ? -1 : 0;
		}
	}
	return blocked;
}

export default function Enemies() {
	return (
		<For each={gameState.enemies}>
			{(enemy, idx) => (
				<Enemy idx={idx()} enemy={enemy} ref={(el) => setGameState('enemies', idx(), 'ref', el)} />
			)}
		</For>
	);
}

interface EnemyProps {
	ref: (ref: HTMLDivElement) => void;
	idx: number;
	enemy: Enemy;
}

function Enemy(props: EnemyProps) {
	createEffect(() => {
		if (props.enemy.attackStatus === 'hit') {
			setGameState('enemies', props.idx, 'attackStatus', 'cooldown');
			setTimeout(() => {
				if (gameState.enemies[props.idx]) {
					setGameState('enemies', props.idx, 'attackStatus', 'ready');
				}
			}, ENEMY_ATTACK_COOLDOWN);
		}
	});

	createEffect(() => {
		console.log(props.enemy.blocked.x);
	});

	return (
		<div
			ref={props.ref}
			class={cn(
				'absolute h-enemy-hitbox w-enemy-hitbox',
				props.enemy.blocked.x === 1 && 'border-r-2 border-red-600',
				props.enemy.blocked.x === -1 && 'border-l-2 border-red-600',
				props.enemy.blocked.y === 1 && 'border-t-2 border-red-600',
				props.enemy.blocked.y === -1 && 'border-b-2 border-red-600',
			)}
		>
			<div
				class={cn(
					'relative left-1/2 top-1/2 h-enemy w-enemy -translate-x-1/2 -translate-y-1/2 animate-move-sprite-sheet-enemy-run overflow-hidden bg-enemy will-change-bp [image-rendering:pixelated]',
					props.enemy.dirX === -1 && '-scale-x-100',
				)}
			/>
		</div>
	);
}
