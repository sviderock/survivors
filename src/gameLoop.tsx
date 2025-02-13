import { bulletPos, resetBullet, setBulletPos } from '~/components/Bullet';
import { playerPos, relativePlayerPos } from '~/components/Player';
import { BULLET_SPEED, ENEMY_SPEED, PLAYER_SPEED } from '~/constants';
import {
	enemies,
	gameState,
	keyPressed,
	setEnemies,
	setGameState,
	setWorldPos,
	worldPos,
} from '~/state';
import { collisionDetected, getNewPos } from '~/utils';

function gameLoop() {
	if (gameState.status !== 'in_progress') return;

	let newX = worldPos().x;
	let newY = worldPos().y;
	if (keyPressed.w) newY += PLAYER_SPEED;
	if (keyPressed.s) newY -= PLAYER_SPEED;
	if (keyPressed.a) newX += PLAYER_SPEED;
	if (keyPressed.d) newX -= PLAYER_SPEED;
	setWorldPos({ x: newX, y: newY });

	const relPlayerPos = {
		left: playerPos().left - newX,
		right: playerPos().right - newX,
		top: playerPos().top - newY,
		bottom: playerPos().bottom - newY,
	};

	for (let i = 0; i < enemies().length; i++) {
		const [enemy, setEnemy] = enemies()[i];

		const enemyCenter = {
			x: enemy().x + enemy().width / 2,
			y: enemy().y + enemy().height / 2,
		};

		let newEnemyX = enemy().x;
		let newEnemyY = enemy().y;
		switch (true) {
			case enemyCenter.x < relPlayerPos.left:
				newEnemyX += ENEMY_SPEED;
				break;

			case enemyCenter.x > relPlayerPos.right:
				newEnemyX -= ENEMY_SPEED;
				break;
		}

		switch (true) {
			case enemyCenter.y < relPlayerPos.top:
				newEnemyY += ENEMY_SPEED;
				break;

			case enemyCenter.y > relPlayerPos.bottom:
				newEnemyY -= ENEMY_SPEED;
				break;
		}

		setEnemy((pos) => ({
			...pos,
			...getNewPos({ x: newEnemyX, y: newEnemyY, width: pos.width, height: pos.height }),
		}));
	}

	if (bulletPos().firedAt) {
		if (bulletPos().x === bulletPos().firedAt!.x && bulletPos().y === bulletPos().firedAt!.y) {
			resetBullet();
		} else {
			let newBulletX = bulletPos().x;
			let newBulletY = bulletPos().y;

			const deltaX = Math.abs(bulletPos().x - bulletPos().firedAt!.x);
			if (deltaX) {
				switch (true) {
					case bulletPos().x < bulletPos().firedAt!.x:
						newBulletX += deltaX < BULLET_SPEED ? deltaX : BULLET_SPEED;
						break;
					case bulletPos().x > bulletPos().firedAt!.x:
						newBulletX -= deltaX <= BULLET_SPEED ? deltaX : BULLET_SPEED;
						break;
				}
			}

			const deltaY = Math.abs(bulletPos().y - bulletPos().firedAt!.y);
			switch (true) {
				case bulletPos().y < bulletPos().firedAt!.y:
					newBulletY += deltaY <= BULLET_SPEED ? deltaY : BULLET_SPEED;
					break;
				case bulletPos().y > bulletPos().firedAt!.y:
					newBulletY -= deltaY <= BULLET_SPEED ? deltaY : BULLET_SPEED;
					break;
			}

			setBulletPos((pos) => ({
				...pos,
				...getNewPos({ x: newBulletX, y: newBulletY, width: pos.width, height: pos.height }),
			}));
		}

		for (let i = 0; i < enemies().length; i++) {
			const [enemy] = enemies()[i];
			if (collisionDetected(bulletPos(), enemy())) {
				setEnemies((prev) => prev.filter((_, idx) => idx !== i));
				setGameState('experience', (exp) => exp + 1);
				resetBullet();
			}

			if (collisionDetected(relativePlayerPos(), enemy())) {
				setGameState('status', 'lost');
			}
		}
	}

	requestAnimationFrame(gameLoop);
}

export function runGameLoop() {
	requestAnimationFrame(gameLoop);
}
