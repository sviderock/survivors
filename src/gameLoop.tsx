import { batch } from "solid-js";
import { produce } from "solid-js/store";
import { destroyEnemy, moveEnemy, spawnEnemy } from "~/components/Enemies";
import { destroyGem, spawnGem } from "~/components/Gems";
import { movePlayer, player, playerRect, setPlayer } from "~/components/Player";
import { destroyArrow } from "~/components/weapons/Arrows";
import {
  ARROW_COLLISIONS,
  ARROW_MAGIC_OFFSET_X,
  ARROW_MAGIC_OFFSET_Y,
  ARROW_SPEED,
  DEBUG_MECHANICS,
  ENEMY_COLLISIONS,
  ENEMY_LIMIT,
  ENEMY_SPAWN_INTERVAL_MS,
  ENEMY_SPEED,
  GAME_WORLD_SIZE,
  GEMS_COLLISIONS,
  SPAWN_ENEMIES,
  SPAWN_GEMS,
} from "~/constants";
import { gameState, setGameState } from "~/state";
import { collisionDetected, getDirection, getNewPos, getRotationDeg } from "~/utils";

let enemySpawnTimer = 0;

export let mainGameLoop: number | undefined;

async function gameLoop(timestamp: number) {
  if (gameState.status !== "in_progress" && !DEBUG_MECHANICS) {
    enemySpawnTimer = 0;
    return;
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

  // move player
  const { newWorldX, newWorldY } = movePlayer();

  const relativePlayerPos = {
    left: playerRect().left - newWorldX,
    right: playerRect().right - newWorldX,
    top: playerRect().top - newWorldY,
    bottom: playerRect().bottom - newWorldY,
    centerX: playerRect().left - newWorldX + playerRect().width / 2,
    centerY: playerRect().top - newWorldY + playerRect().height / 2,
  };

  if (player.attack.status === "ready") {
    setPlayer("attack", "status", "started_attack");
  }

  // move arrows
  for (let i = 0; i < gameState.arrows.length; i++) {
    const arrow = gameState.arrows[i]!;

    if (
      (arrow.rect.x | 0) === (arrow.target.x | 0) &&
      (arrow.rect.y | 0) === (arrow.target.y | 0)
    ) {
      destroyArrow(i);
    } else {
      let newArrowX = arrow.rect.x;
      let newArrowY = arrow.rect.y;

      const deltaX = Math.abs(arrow.rect.x - arrow.target.x);
      if (deltaX) {
        switch (true) {
          case arrow.rect.x < arrow.target.x:
            newArrowX += deltaX < ARROW_SPEED ? deltaX : ARROW_SPEED;
            break;
          case arrow.rect.x > arrow.target.x:
            newArrowX -= deltaX <= ARROW_SPEED ? deltaX : ARROW_SPEED;
            break;
        }
      }

      const deltaY = Math.abs(arrow.rect.y - arrow.target.y);
      switch (true) {
        case arrow.rect.y < arrow.target.y:
          newArrowY += deltaY <= ARROW_SPEED ? deltaY : ARROW_SPEED;
          break;
        case arrow.rect.y > arrow.target.y:
          newArrowY -= deltaY <= ARROW_SPEED ? deltaY : ARROW_SPEED;
          break;
      }

      const updatedRect = getNewPos({
        x: newArrowX,
        y: newArrowY,
        width: arrow.rect.width,
        height: arrow.rect.height,
      });
      setGameState("arrows", i, "rect", updatedRect);
      arrow.ref!.style.transform = `translate3d(calc(${updatedRect.x}px + ${newWorldX}px + ${ARROW_MAGIC_OFFSET_X}px), calc(${updatedRect.y}px + ${newWorldY}px - ${GAME_WORLD_SIZE}px + ${ARROW_MAGIC_OFFSET_Y}px), 0) rotate(${getRotationDeg(arrow.direction)}deg)`;
    }
  }

  // process enemies
  for (let i = 0; i < gameState.enemies.length; i++) {
    const enemy = gameState.enemies[i]!;
    moveEnemy(i, relativePlayerPos, newWorldX, newWorldY);

    // for each enemy detect collisions with arrows
    if (ARROW_COLLISIONS) {
      for (let j = 0; j < gameState.arrows.length; j++) {
        const bullet = gameState.arrows[j]!;
        if (collisionDetected(bullet.rect, enemy.rect)) {
          destroyArrow(j);

          if (enemy.health <= bullet.damage) {
            if (SPAWN_GEMS) {
              spawnGem({ x: enemy.rect.centerX, y: enemy.rect.centerY });
            }

            destroyEnemy(i);
            setGameState("enemiesKilled", gameState.enemiesKilled + 1);
            break;
          }

          setGameState(
            "enemies",
            i,
            produce((e) => {
              e.health -= bullet.damage;
              e.status = "hit";
            })
          );
        }
      }
    }

    // for each enemy detect collisions with player
    if (ENEMY_COLLISIONS) {
      if (collisionDetected(relativePlayerPos, enemy.rect)) {
        if (enemy.attackStatus === "ready") {
          batch(() => {
            setGameState("enemies", i, "attackStatus", "hit");
            setPlayer("health", player.health - enemy.attack);
          });
        }
      }
    }

    // if (gameState.enemies[i]) {
    // 	setGameState('enemies', i, 'blocked', slowCollisionDetect(enemy));
    // }
  }

  // detect player collisions with gems
  if (SPAWN_GEMS && GEMS_COLLISIONS) {
    for (let i = 0; i < gameState.gems.length; i++) {
      const gem = gameState.gems[i]!;
      gem.ref!.style.transform = `translate3d(${gem.rect.x + newWorldX}px, ${gem.rect.y + newWorldY - GAME_WORLD_SIZE}px, 0)`;

      if (collisionDetected(relativePlayerPos, gem.rect)) {
        batch(() => {
          destroyGem(i);
          setGameState("experience", gameState.experience + 1);
        });
      }
    }
  }

  if (player.health <= 0) {
    setGameState("status", "lost");
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
