import { batch, createEffect, For } from 'solid-js';
import { produce } from 'solid-js/store';
import { relativePlayerPos } from '~/components/Player';
import { setTiles, tiles } from '~/components/Terrain';
import {
	ENEMY_ATTACK_COOLDOWN,
	ENEMY_BASE_HEALTH,
	ENEMY_COLLISION_OFFSET,
	ENEMY_MOVEMENT,
	ENEMY_SIZE,
	ENEMY_SPEED,
	GAME_WORLD_SIZE,
	TILE_SIZE,
} from '~/constants';
import { gameState, setGameState } from '~/state';
import { bitwiseAbs, cn, getDirection, getInitialRect, getNewPos, getRandomBetween } from '~/utils';

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
		lastOccupiedTile: { x: 0, y: 0 },
		rect: getInitialRect({
			width: ENEMY_SIZE,
			height: ENEMY_SIZE,
			x: relativePlayerPos().centerX + getRandomBetween(500, 1500, true),
			y: relativePlayerPos().centerY + getRandomBetween(500, 1500, true),
			// x: relativePlayerPos().centerX + -300 + getRandomBetween(10, 30),
			// y: relativePlayerPos().centerY + -300,
		}),
	};
}

export function spawnEnemy() {
	setGameState('enemies', gameState.enemies.length, createSingleEnemy());
}

export function destroyEnemy(idx: number) {
	batch(() => {
		const lastOccupied = gameState.enemies[idx]!.lastOccupiedTile;
		setTiles('occupiedMatrix', lastOccupied.x, lastOccupied.y, 0);
		setGameState(
			'enemies',
			gameState.enemies.filter((_, i) => idx !== i),
		);
	});
}

export function moveEnemy(
	idx: number,
	relativePlayerPos: RectSides & RectCenter,
	newWorldX: number,
	newWorldY: number,
) {
	const enemy = gameState.enemies[idx]!;
	const dirX = getDirection(enemy.rect.centerX, relativePlayerPos.centerX);
	const dirY = getDirection(enemy.rect.centerY, relativePlayerPos.centerY);
	const updatedRect = getNewPos({
		x: enemy.rect.x + (ENEMY_MOVEMENT ? ENEMY_SPEED * dirX : 0),
		y: enemy.rect.y + (ENEMY_MOVEMENT ? ENEMY_SPEED * dirY : 0),
		width: enemy.rect.width,
		height: enemy.rect.height,
	});
	const newEnemyX = updatedRect.x + newWorldX;
	const newEnemyY = updatedRect.y + newWorldY - GAME_WORLD_SIZE;
	enemy.ref!.style.transform = `translate3d(${newEnemyX}px, ${newEnemyY}px, 0)`;

	const { x, y } = updateOccupiedMatrix({ enemy, newEnemyX, newEnemyY, newWorldX, newWorldY });

	batch(() => {
		const lastOccupiedChanged = enemy.lastOccupiedTile.x !== x || enemy.lastOccupiedTile.y !== y;
		if (lastOccupiedChanged) {
			setTiles(
				'occupiedMatrix',
				produce((matrix) => {
					matrix[enemy.lastOccupiedTile.x]![enemy.lastOccupiedTile.y] = 0;
					matrix[x]![y] = 1;
				}),
			);
		}
		setGameState(
			'enemies',
			idx,
			produce((state) => {
				state.rect = updatedRect;
				state.dirX = dirX;
				if (lastOccupiedChanged) {
					state.lastOccupiedTile = { x, y };
				}
			}),
		);
	});
}

export function updateOccupiedMatrix({
	enemy,
	newEnemyX,
	newEnemyY,
	newWorldX,
	newWorldY,
}: {
	enemy: Enemy;
	newWorldX: number;
	newWorldY: number;
	newEnemyX: number;
	newEnemyY: number;
}) {
	const offsetTilesX = bitwiseAbs(tiles.rect.x) / TILE_SIZE;
	const offsetEnemyX = (enemy.rect.x / TILE_SIZE) * 2;
	const offsetWorldX = ((newEnemyX - newWorldX) / TILE_SIZE) * -1;
	const x = (offsetTilesX + offsetEnemyX + offsetWorldX + 0.5) | 0;

	const offsetTilesY = bitwiseAbs(tiles.rect.y) / TILE_SIZE;
	const offsetEnemyY = (enemy.rect.y / TILE_SIZE) * 2;
	const offsetWorldY = ((newEnemyY + GAME_WORLD_SIZE - newWorldY) / TILE_SIZE) * -1;
	const y = (offsetTilesY + offsetEnemyY + offsetWorldY + 1) | 0;

	return { x, y };
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
