import { expose } from 'comlink';
import { ENEMY_SPEED } from '~/constants';
import { getNewPos } from '~/utils';

const worker = {
	updateEnemyPositions: (enemies: Array<Pick<Enemy, 'dirX' | 'dirY'> & { rect: Rect }>) => {
		return enemies.map((enemy) =>
			getNewPos({
				x: enemy.rect.x + ENEMY_SPEED * enemy.dirX,
				y: enemy.rect.y + ENEMY_SPEED * enemy.dirY,
				width: enemy.rect.width,
				height: enemy.rect.height,
			}),
		);
	},

	updateBulletPositions: () => {
		const positions = [] as Rect[];
	},
};

export type GameLoopWorker = typeof worker;

expose(worker);
