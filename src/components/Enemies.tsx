import { createEffect, For } from 'solid-js';
import { produce } from 'solid-js/store';
import { player, relativePlayerPos } from '~/components/Player';
import {
	ENEMY_ATTACK_COOLDOWN,
	ENEMY_BASE_HEALTH,
	ENEMY_MOVEMENT,
	ENEMY_SIZE,
	ENEMY_SPEED,
	GAME_WORLD_SIZE,
	TILE_SIZE,
} from '~/constants';
import { gameState, setGameState } from '~/state';
import {
	bitwiseAbs,
	bitwiseRound,
	cn,
	getDirection,
	getInitialRect,
	getNewPos,
	getRandomBetween,
} from '~/utils';

function createSingleEnemy(): Enemy {
	const health = getRandomBetween(1, ENEMY_BASE_HEALTH) + 10;
	const rect = getInitialRect({
		width: ENEMY_SIZE,
		height: ENEMY_SIZE,
		// x: relativePlayerPos().centerX + getRandomBetween(500, 1500, true),
		// y: relativePlayerPos().centerY + getRandomBetween(500, 1500, true),
		x: relativePlayerPos().centerX + (gameState.enemies.length === 0 ? -200 : -350),
		y: relativePlayerPos().centerY + 0,
	});

	return {
		rect,
		ref: undefined,
		attack: 3,
		attackStatus: 'ready',
		health,
		maxHealth: health,
		blocked: { x: 0, y: 0 },
		status: 'idle',
		dirX: 0,
		dirY: 0,
		lastOccupiedTile: updateOccupiedMatrix(rect),
	};
}

export function spawnEnemy() {
	setGameState(
		produce((state) => {
			const newEnemy = createSingleEnemy();
			state.enemies[state.enemies.length] = newEnemy;
			state.occupiedMatrix[newEnemy.lastOccupiedTile.row]![newEnemy.lastOccupiedTile.col] = 1;
		}),
	);
}

export function destroyEnemy(idx: number) {
	setGameState(
		produce((state) => {
			const lastOccupied = state.enemies[idx]!.lastOccupiedTile;
			state.occupiedMatrix[lastOccupied.row]![lastOccupied.col] = 0;
			state.enemies = state.enemies.filter((_, i) => idx !== i);
		}),
	);
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

	const projectedTile = updateOccupiedMatrix(enemy.rect);
	const inSameTile =
		enemy.lastOccupiedTile.row === projectedTile.row &&
		enemy.lastOccupiedTile.col === projectedTile.col;
	const projectedTileOccupied =
		!inSameTile && !!gameState.occupiedMatrix[projectedTile.row]![projectedTile.col];
	const newTile = { row: projectedTile.row, col: projectedTile.col };

	let { x, y } = enemy.rect;

	if (idx === 0) {
		const newEnemyX = x + newWorldX;
		const newEnemyY = y + newWorldY - GAME_WORLD_SIZE;
		enemy.ref!.style.transform = `translate3d(${newEnemyX}px, ${newEnemyY}px, 0)`;
		return;
	}

	switch (true) {
		case inSameTile: {
			x += ENEMY_MOVEMENT ? ENEMY_SPEED * dirX : 0;
			y += ENEMY_MOVEMENT ? ENEMY_SPEED * dirY : 0;
			break;
		}

		case projectedTileOccupied: {
			console.log(
				`occupied while at ${enemy.lastOccupiedTile.row} ${enemy.lastOccupiedTile.col}`,
				newTile.row,
				newTile.col,
				dirX,
				dirY,
			);

			// if moving left or right
			if (dirX === 1 || dirX === -1) {
				newTile.col = enemy.lastOccupiedTile.col;
				y += ENEMY_SPEED * -1;
			}

			// if moving up or down
			if (dirY === 1 || dirY === -1) {
				newTile.row = enemy.lastOccupiedTile.row;
				x += ENEMY_SPEED * -1;
			}
			break;
		}
	}

	const updatedRect = getNewPos({ x, y, width: enemy.rect.width, height: enemy.rect.height });

	setGameState(
		produce((state) => {
			state.enemies[idx]!.dirX = dirX;
			state.enemies[idx]!.dirY = dirY;
			state.enemies[idx]!.rect = updatedRect;

			if (
				newTile.row !== enemy.lastOccupiedTile.row ||
				newTile.col !== enemy.lastOccupiedTile.col
			) {
				state.occupiedMatrix[enemy.lastOccupiedTile.row]![enemy.lastOccupiedTile.col] = 0;
				state.occupiedMatrix[newTile.row]![newTile.col] = 1;
				state.enemies[idx]!.lastOccupiedTile = { row: newTile.row, col: newTile.col };
			}
		}),
	);

	const newEnemyX = updatedRect.x + newWorldX;
	const newEnemyY = updatedRect.y + newWorldY - GAME_WORLD_SIZE;
	enemy.ref!.style.transform = `translate3d(${newEnemyX}px, ${newEnemyY}px, 0)`;
}

export function updateOccupiedMatrix(enemyRect: Enemy['rect']) {
	const offsetTilesY = bitwiseAbs(gameState.terrainRect.y) / TILE_SIZE;
	const offsetEnemyY = (enemyRect.y / TILE_SIZE) * 2;
	const offsetWorldY = (enemyRect.y / TILE_SIZE) * -1;
	const row = (offsetTilesY + offsetEnemyY + offsetWorldY + 1) | 0;

	const offsetTilesX = bitwiseAbs(gameState.terrainRect.x) / TILE_SIZE;
	const offsetEnemyX = (enemyRect.x / TILE_SIZE) * 2;
	const offsetWorldX = (enemyRect.x / TILE_SIZE) * -1;
	const col = bitwiseRound(offsetTilesX + offsetEnemyX + offsetWorldX + 0.5);

	return { col: col < 0 ? 0 : col, row: row < 0 ? 0 : row };
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
