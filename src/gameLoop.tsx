import { type Remote, wrap } from 'comlink';
import { batch } from 'solid-js';
import { isServer } from 'solid-js/web';
import { destroyEnemy, spawnEnemy } from '~/components/Enemies';
import { destroyGem, spawnGem } from '~/components/Gems';
import { movePlayer, player, relativePlayerPos, setPlayer } from '~/components/Player';
import { destroyBullet, spawnBullet } from '~/components/weapons/Bullets';
import { BULLET_SPEED, PLAYER_FREE_MOVEMENT } from '~/constants';
import { gameState, setGameState } from '~/state';
import { collisionDetected, getNewPos } from '~/utils';
import type { GameLoopWorker } from '~/workers/gameLoopWorker';

let worker: Remote<GameLoopWorker>;

if (!isServer) {
	const unwrappedWorker = new Worker(new URL('./workers/gameLoopWorker.ts', import.meta.url), {
		type: 'module',
		name: 'game-loop-worker',
	});
	worker = wrap<GameLoopWorker>(unwrappedWorker);
}

const SPAWN_ENEMIES = true;
const SPAWN_BULLETS = true;

const ENEMY_SPAWN_INTERVAL_MS = 500;
const BULLET_SPAWN_INTERVAL_MS = 1000;

const ENEMY_COLLISIONS = true;
const BULLET_COLLISIONS = true;
const GEMS_COLLISIONS = true;

const ENEMY_LIMIT = 150;

let enemySpawnTimer = 0;
let bulletSpawnTimer = 0;
let gameStageTimer = 0;

export let mainGameLoop: number | undefined;

async function gameLoop(timestamp: number) {
	if (gameState.status !== 'in_progress') {
		if (PLAYER_FREE_MOVEMENT) {
			movePlayer();
			mainGameLoop = requestAnimationFrame(gameLoop);
			return;
		}

		enemySpawnTimer = 0;
		bulletSpawnTimer = 0;
		return;
	}

	if (gameStageTimer === 0) {
		gameStageTimer = timestamp;
	}

	if (SPAWN_ENEMIES) {
		if (!enemySpawnTimer) enemySpawnTimer = timestamp;
		if (timestamp - enemySpawnTimer >= (gameState.enemySpawnInterval || ENEMY_SPAWN_INTERVAL_MS)) {
			if (gameState.enemies.length < ENEMY_LIMIT) {
				spawnEnemy();
			}
			enemySpawnTimer += gameState.enemySpawnInterval || ENEMY_SPAWN_INTERVAL_MS;
		}
	}

	if (SPAWN_BULLETS) {
		if (!bulletSpawnTimer) bulletSpawnTimer = timestamp;
		if (
			timestamp - bulletSpawnTimer >=
			(gameState.bulletSpawnInterval || BULLET_SPAWN_INTERVAL_MS)
		) {
			spawnBullet();
			bulletSpawnTimer += gameState.bulletSpawnInterval || BULLET_SPAWN_INTERVAL_MS;
		}
	}

	const { newWorldX, newWorldY } = movePlayer();

	const relPlayerPos = {
		left: player.rect.left - newWorldX,
		right: player.rect.right - newWorldX,
		top: player.rect.top - newWorldY,
		bottom: player.rect.bottom - newWorldY,
	};

	const positions = await worker.updateEnemyPositions({
		relPlayerPos,
		enemies: gameState.enemies.map((e) => e.rect()),
	});

	positions.forEach((p, i) => {
		const enemy = gameState.enemies[i]!;
		enemy.setRect(p);
	});

	for (let i = 0; i < gameState.bullets.length; i++) {
		const bullet = gameState.bullets[i]!;

		if (
			(bullet.rect().x | 0) === (bullet.target.x | 0) &&
			(bullet.rect().y | 0) === (bullet.target.y | 0)
		) {
			destroyBullet(i);
		} else {
			let newBulletX = bullet.rect().x;
			let newBulletY = bullet.rect().y;

			const deltaX = Math.abs(bullet.rect().x - bullet.target.x);
			if (deltaX) {
				switch (true) {
					case bullet.rect().x < bullet.target.x:
						newBulletX += deltaX < BULLET_SPEED ? deltaX : BULLET_SPEED;
						break;
					case bullet.rect().x > bullet.target.x:
						newBulletX -= deltaX <= BULLET_SPEED ? deltaX : BULLET_SPEED;
						break;
				}
			}

			const deltaY = Math.abs(bullet.rect().y - bullet.target.y);
			switch (true) {
				case bullet.rect().y < bullet.target.y:
					newBulletY += deltaY <= BULLET_SPEED ? deltaY : BULLET_SPEED;
					break;
				case bullet.rect().y > bullet.target.y:
					newBulletY -= deltaY <= BULLET_SPEED ? deltaY : BULLET_SPEED;
					break;
			}

			bullet.setRect(
				getNewPos({
					x: newBulletX,
					y: newBulletY,
					width: bullet.rect().width,
					height: bullet.rect().height,
				}),
			);
		}
	}

	for (let i = 0; i < gameState.enemies.length; i++) {
		const enemy = gameState.enemies[i]!;

		if (BULLET_COLLISIONS) {
			for (let j = 0; j < gameState.bullets.length; j++) {
				const bullet = gameState.bullets[j]!;
				if (collisionDetected(bullet.rect(), enemy.rect())) {
					batch(() => {
						if (enemy.health <= bullet.damage) {
							spawnGem({ x: enemy.rect().centerX, y: enemy.rect().centerY });
							destroyEnemy(i);
							destroyBullet(j);
							setGameState('enemiesKilled', (k) => k + 1);
						} else {
							destroyBullet(j);
							setGameState('enemies', i, 'health', enemy.health - bullet.damage);
						}
					});
				}
			}
		}

		if (ENEMY_COLLISIONS) {
			if (collisionDetected(relativePlayerPos(), enemy.rect())) {
				if (enemy.attackStatus() === 'ready') {
					batch(() => {
						enemy.setAttackStatus('hit');
						setPlayer('health', (health) => health - enemy.attack);
					});
				}
			}
		}
	}

	if (GEMS_COLLISIONS) {
		for (let i = 0; i < gameState.gems.length; i++) {
			const gem = gameState.gems[i]!;
			if (collisionDetected(relativePlayerPos(), gem.rect())) {
				destroyGem(i);
				setGameState('experience', (exp) => exp + 1);
			}
		}
	}

	if (player.health <= 0) {
		setGameState('status', 'lost');
		clearGameLoop();
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
