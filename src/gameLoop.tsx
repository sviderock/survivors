import { produce } from 'solid-js/store';
import { bulletPos, resetBullet, setBulletPos } from '~/components/Bullet';
import { getNewEnemyPos } from '~/components/Enemies';
import { playerPos, relativePlayerPos } from '~/components/Player';
import { BULLET_SPEED, ENEMY_SPEED, PLAYER_SPEED } from '~/constants';
import {
	createSingleEnemy,
	enemies,
	gameState,
	keyPressed,
	setEnemies,
	setGameState,
	setStageTimer,
	setWorldPos,
	worldPos,
} from '~/state';
import { collisionDetected, getNewPos } from '~/utils';

const ENEMY_SPAWN_INTERVAL_MS = 500;
let enemySpawnTimer = 0;
let gameStartedAt = 0;

function gameLoop(timestamp: number) {
	console.log(gameStartedAt);
	if (gameState.status !== 'in_progress') {
		if (gameState.status === 'paused') {
		}

		return;
	}

	if (gameStartedAt === 0) {
		gameStartedAt = timestamp;
	}
	setStageTimer(timestamp - gameStartedAt);

	if (!enemySpawnTimer) enemySpawnTimer = timestamp;
	if (timestamp - enemySpawnTimer >= ENEMY_SPAWN_INTERVAL_MS) {
		setEnemies(
			produce((enemies) => {
				enemies.push(createSingleEnemy(getNewEnemyPos()));
			}),
		);
		console.log('spawn');
		enemySpawnTimer += ENEMY_SPAWN_INTERVAL_MS;
	}

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

	for (let i = 0; i < enemies.length; i++) {
		const enemy = enemies[i]!;

		const enemyCenter = {
			x: enemy.rect().x + enemy.rect().width / 2,
			y: enemy.rect().y + enemy.rect().height / 2,
		};

		let newEnemyX = enemy.rect().x;
		let newEnemyY = enemy.rect().y;
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

		enemy.setRect((pos) => ({
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

		for (let i = 0; i < enemies.length; i++) {
			const enemy = enemies[i]!;
			if (collisionDetected(bulletPos(), enemy.rect())) {
				setEnemies((prev) => prev.filter((_, idx) => idx !== i));
				setGameState('experience', (exp) => exp + 1);
				resetBullet();
			}

			if (collisionDetected(relativePlayerPos(), enemy.rect())) {
				setGameState('status', 'lost');
			}
		}
	}

	requestAnimationFrame(gameLoop);
}

export function runGameLoop() {
	requestAnimationFrame(gameLoop);
}
