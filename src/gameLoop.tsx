import { type Remote, wrap } from 'comlink';
import { timeStamp } from 'console';
import { batch } from 'solid-js';
import { isServer } from 'solid-js/web';
import { destroyEnemy, enemies, setEnemies, spawnEnemy } from '~/components/Enemies';
import { destroyGem, gems, spawnGem } from '~/components/Gems';
import { player, relativePlayerPos, setPlayer } from '~/components/Player';
import { bullets, destroyBullet, spawnBullet } from '~/components/weapons/Bullets';
import { BULLET_SPEED, ENEMY_SPEED, PLAYER_SPEED } from '~/constants';
import { gameState, keyPressed, setGameState, setStageTimer, setWorldPos, worldPos } from '~/state';
import { collisionDetected, getDirection, getNewPos } from '~/utils';
import type { GameLoopWorker } from '~/workers/gameLoopWorker';

let updateEnemyPositions: Remote<GameLoopWorker['updateEnemyPositions']>;

if (!isServer) {
	const worker = new Worker(new URL('./workers/gameLoopWorker.ts', import.meta.url), {
		type: 'module',
		name: 'game-loop-worker',
	});
	updateEnemyPositions = wrap<GameLoopWorker>(worker).updateEnemyPositions;
}

const SPAWN_ENEMIES = true;
const SPAWN_BULLETS = true;

const CALCULATIONS_INTERVAL_MS = 1000;
const ENEMY_SPAWN_INTERVAL_MS = 500;
const BULLET_SPAWN_INTERVAL_MS = 1000;

const ENEMY_COLLISIONS = true;
const BULLET_COLLISIONS = true;
const GEMS_COLLISIONS = true;

const ENEMY_LIMIT = 300;

const COLLISION_OFFSET = 0;
const DIAGONAL_SPEED = +(Math.SQRT2 / 2).toPrecision(1);

let enemySpawnTimer = 0;
let bulletSpawnTimer = 0;
let gameStageTimer = 0;
let gameStageTimerStoppedAt = 0;

export let mainGameLoop: number | undefined;

async function gameLoop(timestamp: number) {
	if (gameState.status !== 'in_progress') {
		enemySpawnTimer = 0;
		bulletSpawnTimer = 0;
		if (gameState.status === 'paused') {
			gameStageTimerStoppedAt = timestamp;
		}
		return;
	}

	if (gameStageTimer === 0) {
		gameStageTimer = timestamp;
	}

	setStageTimer(timestamp - gameStageTimer - gameStageTimerStoppedAt);

	if (SPAWN_ENEMIES) {
		if (!enemySpawnTimer) enemySpawnTimer = timestamp;
		if (timestamp - enemySpawnTimer >= (gameState.enemySpawnInterval || ENEMY_SPAWN_INTERVAL_MS)) {
			if (enemies.length < ENEMY_LIMIT) {
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

	const playerSpeedModifier =
		(keyPressed.w && keyPressed.a) ||
		(keyPressed.w && keyPressed.d) ||
		(keyPressed.s && keyPressed.a) ||
		(keyPressed.s && keyPressed.d)
			? DIAGONAL_SPEED
			: 1;

	let newWorldX = worldPos().x;
	let newWorldY = worldPos().y;
	if (keyPressed.w) newWorldY += (PLAYER_SPEED * playerSpeedModifier) | 0;
	if (keyPressed.s) newWorldY -= (PLAYER_SPEED * playerSpeedModifier) | 0;
	if (keyPressed.a) newWorldX += (PLAYER_SPEED * playerSpeedModifier) | 0;
	if (keyPressed.d) newWorldX -= (PLAYER_SPEED * playerSpeedModifier) | 0;
	setWorldPos({ x: newWorldX, y: newWorldY });

	const relPlayerPos = {
		left: player().rect.left - newWorldX,
		right: player().rect.right - newWorldX,
		top: player().rect.top - newWorldY,
		bottom: player().rect.bottom - newWorldY,
	};

	for (let i = 0; i < enemies.length; i++) {
		const enemy = enemies[i]!;

		const dirX =
			getDirection(enemy.rect().centerX, relPlayerPos.left, relPlayerPos.right) * ENEMY_SPEED;
		const dirY =
			getDirection(enemy.rect().centerY, relPlayerPos.top, relPlayerPos.bottom) * ENEMY_SPEED;
		const newPos = getNewPos({
			x: enemy.rect().x + dirX,
			y: enemy.rect().y + dirY,
			width: enemy.rect().width,
			height: enemy.rect().height,
		});

		const blocked: Enemy['blocked'] = { left: false, right: false, top: false, bottom: false };

		enemy.setRect(newPos);
	}

	for (let i = 0; i < bullets.length; i++) {
		const bullet = bullets[i]!;

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

	for (let i = 0; i < enemies.length; i++) {
		const enemy = enemies[i]!;

		if (BULLET_COLLISIONS) {
			for (let j = 0; j < bullets.length; j++) {
				const bullet = bullets[j]!;
				if (collisionDetected(bullet.rect(), enemy.rect())) {
					batch(() => {
						if (enemy.health <= bullet.damage) {
							spawnGem({ x: enemy.rect().centerX, y: enemy.rect().centerY });
							destroyEnemy(i);
							destroyBullet(j);
							setGameState('enemiesKilled', (k) => k + 1);
						} else {
							destroyBullet(j);
							setEnemies(i, 'health', enemy.health - bullet.damage);
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
						setPlayer((p) => ({ ...p, health: p.health - enemy.attack }));
					});
				}
			}
		}
	}

	if (GEMS_COLLISIONS) {
		for (let i = 0; i < gems.length; i++) {
			const gem = gems[i]!;
			if (collisionDetected(relativePlayerPos(), gem.rect())) {
				destroyGem(i);
				setGameState('experience', (exp) => exp + 1);
			}
		}
	}

	if (player().health <= 0) {
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
