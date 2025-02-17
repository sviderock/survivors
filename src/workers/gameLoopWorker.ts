import { expose } from 'comlink';
import { ENEMY_SPEED } from '~/constants';
import { getDirection, getNewPos } from '~/utils';

const worker = {
	updateEnemyPositions: ({
		relPlayerPos,
		enemies,
	}: {
		relPlayerPos: RectSides;
		enemies: Rect[];
	}) => {
		const positions = [] as Rect[];
		for (let i = 0; i < enemies.length; i++) {
			const enemy = enemies[i]!;

			const dirX = getDirection(enemy.centerX, relPlayerPos.left, relPlayerPos.right) * ENEMY_SPEED;
			const dirY = getDirection(enemy.centerY, relPlayerPos.top, relPlayerPos.bottom) * ENEMY_SPEED;
			positions.push(
				getNewPos({
					x: enemy.x + dirX,
					y: enemy.y + dirY,
					width: enemy.width,
					height: enemy.height,
				}),
			);
		}
		return positions;
	},

	updateBulletPositions: () => {
		const positions = [] as Rect[];
	},
};

export type GameLoopWorker = typeof worker;

expose(worker);
