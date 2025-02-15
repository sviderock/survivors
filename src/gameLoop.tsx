import { batch } from 'solid-js';
import { destroyEnemy, enemies, spawnNewEnemy } from '~/components/Enemies';
import { player, relativePlayerPos } from '~/components/Player';
import { bullets, destroyBullet, spawnNewBullet } from '~/components/weapons/Bullets';
import { BULLET_SPEED, ENEMY_SPEED, PLAYER_SPEED } from '~/constants';
import {
	gameState,
	keyPressed,
	setGameState,
	setStageTimer,
	setWorldPos,
	speedModifier,
	worldPos,
} from '~/state';
import { collisionDetected, getNewPos } from '~/utils';

const ENEMY_SPAWN_INTERVAL_MS = 500;
const BULLET_SPAWN_INTERVAL_MS = 1000;

let enemySpawnTimer = 0;
let bulletSpawnTimer = 0;
let gameStageTimer = 0;
let gameStageTimerStoppedAt = 0;

export let mainGameLoop: number | undefined;

function gameLoop(timestamp: number) {
	if (gameState.status !== 'in_progress') {
		if (gameState.status === 'paused') {
			gameStageTimerStoppedAt = timestamp;
			enemySpawnTimer = 0;
			bulletSpawnTimer = 0;
		}
		return;
	}

	if (gameStageTimer === 0) {
		gameStageTimer = timestamp;
	}

	setStageTimer(timestamp - gameStageTimer - gameStageTimerStoppedAt);

	if (!enemySpawnTimer) enemySpawnTimer = timestamp;
	if (timestamp - enemySpawnTimer >= ENEMY_SPAWN_INTERVAL_MS) {
		spawnNewEnemy();
		enemySpawnTimer += ENEMY_SPAWN_INTERVAL_MS;
	}

	if (!bulletSpawnTimer) bulletSpawnTimer = timestamp;
	if (timestamp - bulletSpawnTimer >= BULLET_SPAWN_INTERVAL_MS) {
		spawnNewBullet();
		bulletSpawnTimer += BULLET_SPAWN_INTERVAL_MS;
	}

	let newX = worldPos().x;
	let newY = worldPos().y;
	if (keyPressed.w) newY += PLAYER_SPEED * speedModifier();
	if (keyPressed.s) newY -= PLAYER_SPEED * speedModifier();
	if (keyPressed.a) newX += PLAYER_SPEED * speedModifier();
	if (keyPressed.d) newX -= PLAYER_SPEED * speedModifier();
	setWorldPos({ x: newX, y: newY });

	const relPlayerPos = {
		left: player().rect.left - newX,
		right: player().rect.right - newX,
		top: player().rect.top - newY,
		bottom: player().rect.bottom - newY,
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
				newEnemyX += ENEMY_SPEED * speedModifier();
				break;

			case enemyCenter.x > relPlayerPos.right:
				newEnemyX -= ENEMY_SPEED * speedModifier();
				break;
		}

		switch (true) {
			case enemyCenter.y < relPlayerPos.top:
				newEnemyY += ENEMY_SPEED * speedModifier();
				break;

			case enemyCenter.y > relPlayerPos.bottom:
				newEnemyY -= ENEMY_SPEED * speedModifier();
				break;
		}

		enemy.setRect((pos) => ({
			...pos,
			...getNewPos({ x: newEnemyX, y: newEnemyY, width: pos.width, height: pos.height }),
		}));
	}

	for (let i = 0; i < bullets.length; i++) {
		const bullet = bullets[i]!;

		if (bullet.rect().x === bullet.target.x && bullet.rect().y === bullet.target.y) {
			destroyBullet(i);
		} else {
			let newBulletX = bullet.rect().x;
			let newBulletY = bullet.rect().y;

			const deltaX = Math.abs(bullet.rect().x - bullet.target.x);
			if (deltaX) {
				switch (true) {
					case bullet.rect().x < bullet.target.x:
						newBulletX += (deltaX < BULLET_SPEED ? deltaX : BULLET_SPEED) * speedModifier();
						break;
					case bullet.rect().x > bullet.target.x:
						newBulletX -= (deltaX <= BULLET_SPEED ? deltaX : BULLET_SPEED) * speedModifier();
						break;
				}
			}

			const deltaY = Math.abs(bullet.rect().y - bullet.target.y);
			switch (true) {
				case bullet.rect().y < bullet.target.y:
					newBulletY += (deltaY <= BULLET_SPEED ? deltaY : BULLET_SPEED) * speedModifier();
					break;
				case bullet.rect().y > bullet.target.y:
					newBulletY -= (deltaY <= BULLET_SPEED ? deltaY : BULLET_SPEED) * speedModifier();
					break;
			}

			bullet.setRect((pos) => ({
				...pos,
				...getNewPos({ x: newBulletX, y: newBulletY, width: pos.width, height: pos.height }),
			}));
		}

		for (let i = 0; i < enemies.length; i++) {
			const enemy = enemies[i]!;

			for (let j = 0; j < bullets.length; j++) {
				const bullet = bullets[j]!;
				if (collisionDetected(bullet.rect(), enemy.rect())) {
					batch(() => {
						destroyEnemy(i);
						destroyBullet(j);
						setGameState('experience', (exp) => exp + 1);
					});
				}
			}

			if (collisionDetected(relativePlayerPos(), enemy.rect())) {
				setGameState('status', 'lost');
			}
		}
	}

	mainGameLoop = requestAnimationFrame(gameLoop);
}

export function runGameLoop() {
	mainGameLoop = requestAnimationFrame(gameLoop);
}

export function clearGameLoop() {
	if (mainGameLoop) {
		cancelAnimationFrame(mainGameLoop);
		mainGameLoop = undefined;
	}
}
