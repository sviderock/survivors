import { batch } from "solid-js";
import { produce } from "solid-js/store";
import { moveEnemy, spawnEnemy } from "~/components/Enemies";
import { destroyGem, spawnGem } from "~/components/Gems";
import { movePlayer, player, playerRect, setPlayer } from "~/components/Player";
import { destroyArrow } from "~/components/weapons/Arrows";
import {
  ARROW_COLLISIONS,
  ARROW_MODEL_SIZE,
  ARROW_SPEED,
  DEBUG,
  DEBUG_MECHANICS,
  ENEMY_COLLISIONS,
  ENEMY_LIMIT,
  ENEMY_SPAWN_INTERVAL_MS,
  GAME_WORLD_SIZE,
  GEMS_COLLISIONS,
  SPAWN_ENEMIES,
  SPAWN_GEMS,
  ARROW_HITBOX_SIZE,
} from "~/constants";
import { gameState, setGameState } from "~/state";
import {
  calculateRotatedPosition,
  collisionDetected,
  getInitialRect,
  getNewPos,
  getRotationDeg,
} from "~/utils";

const TICK = 16.66666666; // 60 fps
let tickTimer = 0;
let enemySpawnTimer = 0;

let stopSpawningEnemies = false;

export let mainGameLoop: number | undefined;

async function gameLoop(timestamp: number) {
  /**
   * In order to keep the game updates more consistent – we need to limit amount of updates per second.
   * 120 fps was way too inconsistent.
   * 60 fps seems to be working good so far.
   */
  if (!tickTimer) tickTimer = timestamp;
  if (timestamp - tickTimer < TICK) {
    return runGameLoop();
  }
  tickTimer += TICK;

  if (gameState.status !== "in_progress" && !DEBUG_MECHANICS) {
    enemySpawnTimer = 0;
    return;
  }

  if (SPAWN_ENEMIES && !stopSpawningEnemies) {
    if (!enemySpawnTimer) enemySpawnTimer = timestamp;
    if (timestamp - enemySpawnTimer >= (gameState.enemySpawnInterval || ENEMY_SPAWN_INTERVAL_MS)) {
      if (gameState.enemies.length < ENEMY_LIMIT) {
        spawnEnemy();
        if (DEBUG) {
          // stopSpawningEnemies = true;
        }
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

      const arrowDirection = getRotationDeg(arrow.direction);
      const updatedRect = getNewPos({
        x: newArrowX,
        y: newArrowY,
        width: arrow.rect.width,
        height: arrow.rect.height,
      });

      const modelTransformX = updatedRect.x + newWorldX;
      const modelTransformY = updatedRect.y + newWorldY - GAME_WORLD_SIZE;
      const hitboxTopLeft = calculateRotatedPosition({
        angle: arrowDirection,
        startOffsetX: updatedRect.x,
        startOffsetY: updatedRect.y,
        modelSize: ARROW_MODEL_SIZE,
        hitboxSize: ARROW_HITBOX_SIZE,
        shiftHitbox: true,
      });
      const hitboxRect = getInitialRect({
        ...hitboxTopLeft,
        width: ARROW_HITBOX_SIZE.w,
        height: ARROW_HITBOX_SIZE.h,
      });

      const hitboxTransformX = arrow.hitbox.left + newWorldX;
      const hitboxTransformY = arrow.hitbox.top + newWorldY - GAME_WORLD_SIZE;

      setGameState(
        "arrows",
        i,
        produce((arrow) => {
          arrow.rect = updatedRect;
          arrow.hitbox = hitboxRect;
        })
      );
      arrow.ref!.style.transform = `translate3d(${modelTransformX}px, ${modelTransformY}px, 0) rotate(${-arrowDirection}deg)`;
      arrow.hitboxRef!.style.transform = `translate3d(${hitboxTransformX}px, ${hitboxTransformY}px, 0)`;
    }
  }

  // process enemies
  for (let i = 0; i < gameState.enemies.length; i++) {
    const enemy = gameState.enemies[i]!;
    moveEnemy(i, relativePlayerPos, newWorldX, newWorldY);

    // for each enemy detect collisions with arrows
    if (ARROW_COLLISIONS && enemy.lifeStatus === "alive") {
      for (let j = 0; j < gameState.arrows.length; j++) {
        const arrow = gameState.arrows[j]!;

        if (collisionDetected(arrow.hitbox, enemy.rect)) {
          destroyArrow(j);

          if (enemy.health <= arrow.damage) {
            if (SPAWN_GEMS) {
              spawnGem({ x: enemy.rect.centerX, y: enemy.rect.centerY });
            }

            setGameState(
              produce((state) => {
                state.enemiesKilled++;
                state.enemies[i]!.lifeStatus = "died";
              })
            );
            break;
          }

          setGameState(
            "enemies",
            i,
            produce((e) => {
              e.health -= arrow.damage;
              e.status = "hit";
            })
          );
        }
      }
    }

    // for each enemy detect collisions with player
    if (ENEMY_COLLISIONS && enemy.lifeStatus === "alive") {
      if (collisionDetected(relativePlayerPos, enemy.rect)) {
        if (enemy.attackStatus === "ready") {
          batch(() => {
            setGameState("enemies", i, "attackStatus", "hit");
            setPlayer("health", player.health - enemy.attack);
          });
        }
      }
    }
  }

  // detect player collisions with gems
  if (SPAWN_GEMS && GEMS_COLLISIONS) {
    for (let i = 0; i < gameState.gems.length; i++) {
      const gem = gameState.gems[i]!;
      const transformX = gem.rect.x + newWorldX;
      const transformY = gem.rect.y + newWorldY - GAME_WORLD_SIZE;
      gem.ref!.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;

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
