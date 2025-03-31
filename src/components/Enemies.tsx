import { For, Match, Switch, createEffect, onMount } from "solid-js";
import { produce } from "solid-js/store";
import { player, relativePlayerPos } from "~/components/Player";
import { getTileInfoKey } from "~/components/Terrain";
import {
  BLOOD_ANIMATION_DURATION_SS,
  DEBUG,
  ENEMY_ATTACK_COOLDOWN,
  ENEMY_DIED_HIDE_MODEL_DURATION_SS,
  ENEMY_SPEED,
  GAME_WORLD_SIZE,
  SKULL_SIZE,
  TILE_SIZE,
} from "~/constants";
import { gameState, setGameState } from "~/state";
import { bitwiseAbs, cn, getDirection, getInitialRect, getNewPos, getRandomBetween } from "~/utils";

function createSingleEnemy(): Enemy {
  // const health = getRandomBetween(1, ENEMY_BASE_HEALTH) + 10;
  const health = 1;

  return {
    rect: {} as Rect,
    ref: undefined,
    attack: 3,
    attackStatus: "ready",
    health,
    maxHealth: health,
    blocked: { x: 0, y: 0 },
    status: "moving",
    lifeStatus: "alive",
    dirX: 0,
    dirY: 0,
    occupiedTile: {} as Enemy["occupiedTile"],
    nextTile: {} as Enemy["nextTile"],
    playerReached: false,
  };
}

export function spawnEnemy() {
  setGameState(
    produce((state) => {
      const newEnemy = createSingleEnemy();
      state.enemies[state.enemies.length] = newEnemy;
    })
  );
}

export function destroyEnemy(idx: number) {
  setGameState(
    produce((state) => {
      const lastOccupied = state.enemies[idx]!.occupiedTile;
      state.occupiedTile[getTileInfoKey(lastOccupied.row, lastOccupied.col)] = undefined;
      state.enemies = state.enemies.filter((_, i) => idx !== i);
    })
  );
}

function getMovingDirection(row: number, col: number) {
  return {
    horizontal:
      player.occupiedTile.col > col ? "right" : player.occupiedTile.col < col ? "left" : "nowhere",
    vertical:
      player.occupiedTile.row > row ? "bottom" : player.occupiedTile.row < row ? "top" : "nowhere",
  } as const;
}

function getNextTile(row: number, col: number): Tile {
  const { vertical, horizontal } = getMovingDirection(row, col);
  const nextCol = col + 1;
  const prevCol = col - 1;
  const nextRow = row + 1;
  const prevRow = row - 1;
  const tileRightOccupied = gameState.occupiedTile[getTileInfoKey(row, nextCol)];
  const tileLeftOccupied = gameState.occupiedTile[getTileInfoKey(row, prevCol)];
  const tileTopOccupied = gameState.occupiedTile[getTileInfoKey(prevRow, col)];
  const tileBottomOccupied = gameState.occupiedTile[getTileInfoKey(nextRow, col)];
  const tileTopRightOccupied = gameState.occupiedTile[getTileInfoKey(prevRow, nextCol)];
  const tileTopLeftOccupied = gameState.occupiedTile[getTileInfoKey(prevRow, prevCol)];
  const tileBottomRightOccupied = gameState.occupiedTile[getTileInfoKey(nextRow, nextCol)];
  const tileBottomLeftOccupied = gameState.occupiedTile[getTileInfoKey(nextRow, prevCol)];

  // console.log(
  //   `going ${vertical} ${horizontal}`,
  //   tileRightOccupied
  //     ? "tileRightOccupied"
  //     : tileLeftOccupied
  //       ? "tileLeftOccupied"
  //       : tileTopOccupied
  //         ? "tileTopOccupied"
  //         : tileBottomOccupied
  //           ? "tileBottomOccupied"
  //           : tileTopRightOccupied
  //             ? "tileTopRightOccupied"
  //             : tileTopLeftOccupied
  //               ? "tileTopLeftOccupied"
  //               : tileBottomRightOccupied
  //                 ? "tileBottomRightOccupied"
  //                 : tileBottomLeftOccupied
  //                   ? "tileBottomLeftOccupied"
  //                   : "NOT_OCCUPIED"
  // );

  switch (true) {
    case (player.occupiedTile.row === row &&
      (player.occupiedTile.col === nextCol || player.occupiedTile.col === prevCol)) ||
      (player.occupiedTile.col === col &&
        (player.occupiedTile.row === nextRow || player.occupiedTile.row === prevRow)): {
      break;
    }

    case vertical === "top" && horizontal === "right": {
      if (!tileTopRightOccupied) return { row: prevRow, col: nextCol };
      if (!tileRightOccupied) return { row: row, col: nextCol };
      if (!tileTopOccupied) return { row: prevRow, col: col };
      break;
    }

    case vertical === "top" && horizontal === "left": {
      if (!tileTopLeftOccupied) return { row: prevRow, col: prevCol };
      if (!tileLeftOccupied) return { row: row, col: prevCol };
      if (!tileTopOccupied) return { row: prevRow, col: col };
      break;
    }

    case vertical === "top" && horizontal === "nowhere": {
      if (!tileTopOccupied) return { row: prevRow, col: col };
      if (!tileLeftOccupied) return { row: row, col: prevCol };
      if (!tileRightOccupied) return { row: row, col: nextCol };
      break;
    }

    case vertical === "bottom" && horizontal === "right": {
      if (!tileBottomRightOccupied) return { row: nextRow, col: nextCol };
      if (!tileRightOccupied) return { row: row, col: nextCol };
      if (!tileBottomOccupied) return { row: nextRow, col: col };
      break;
    }

    case vertical === "bottom" && horizontal === "left": {
      if (!tileBottomLeftOccupied) return { row: nextRow, col: prevCol };
      if (!tileLeftOccupied) return { row: row, col: prevCol };
      if (!tileBottomOccupied) return { row: nextRow, col: col };
      break;
    }

    case vertical === "bottom" && horizontal === "nowhere": {
      if (!tileBottomOccupied) return { row: nextRow, col: col };
      if (!tileLeftOccupied) return { row: row, col: prevCol };
      if (!tileRightOccupied) return { row: row, col: nextCol };
      break;
    }

    case vertical === "nowhere" && horizontal === "right": {
      if (!tileRightOccupied) return { row: row, col: nextCol };
      if (!tileTopOccupied) return { row: prevRow, col: col };
      if (!tileBottomOccupied) return { row: nextRow, col: col };
      break;
    }

    case vertical === "nowhere" && horizontal === "left": {
      if (!tileLeftOccupied) return { row: row, col: prevCol };
      if (!tileTopOccupied) return { row: prevRow, col: col };
      if (!tileBottomOccupied) return { row: nextRow, col: col };
      break;
    }
  }

  // console.log("NOWHERE TO GO", vertical, horizontal);
  return { row, col };
}

export function moveEnemy(
  idx: number,
  relativePlayerPos: RectSides & RectCenter,
  newWorldX: number,
  newWorldY: number
) {
  const enemy = gameState.enemies[idx]!;
  const dirX = getDirection(enemy.rect.centerX, relativePlayerPos.centerX);
  const dirY = getDirection(enemy.rect.centerY, relativePlayerPos.centerY);
  let { x, y } = enemy.rect;

  if (DEBUG) {
    if (idx === 0) {
      const newEnemyX = x + newWorldX;
      const newEnemyY = y + newWorldY - GAME_WORLD_SIZE;
      enemy.ref!.style.transform = `translate3d(${newEnemyX}px, ${newEnemyY}px, 0)`;
      return;
    }
  }

  const projectedTile = updateOccupiedMatrix(enemy.rect);
  const nextTile = getNextTile(enemy.occupiedTile.row, enemy.occupiedTile.col);

  if (enemy.lifeStatus === "alive") {
    x += ENEMY_SPEED * getDirection(enemy.occupiedTile.col, nextTile.col);
    y += ENEMY_SPEED * getDirection(enemy.occupiedTile.row, nextTile.row);
  }

  const updatedRect = getNewPos({ x, y, width: enemy.rect.width, height: enemy.rect.height });

  setGameState(
    produce((state) => {
      state.enemies[idx]!.dirX = dirX;
      state.enemies[idx]!.dirY = dirY;
      state.enemies[idx]!.rect = updatedRect;

      if (
        enemy.occupiedTile.row !== projectedTile.row ||
        enemy.occupiedTile.col !== projectedTile.col
      ) {
        const oldOccupiedKey = getTileInfoKey(enemy.occupiedTile.row, enemy.occupiedTile.col);
        const newOccupiedKey = getTileInfoKey(projectedTile.row, projectedTile.col);
        if (!state.occupiedTile[newOccupiedKey]) {
          state.occupiedTile[oldOccupiedKey] = undefined;
          state.occupiedTile[newOccupiedKey] = 1;
          state.enemies[idx]!.occupiedTile = projectedTile;
        }
      }

      state.enemies[idx]!.playerReached =
        projectedTile.row === player.occupiedTile.row ||
        projectedTile.col === player.occupiedTile.col;

      state.projectedTile[getTileInfoKey(enemy.nextTile.row, enemy.nextTile.col)] = undefined;
      state.projectedTile[getTileInfoKey(nextTile.row, nextTile.col)] = 1;
      state.enemies[idx]!.nextTile = nextTile;
    })
  );

  const newEnemyX = updatedRect.x + newWorldX;
  const newEnemyY = updatedRect.y + newWorldY - GAME_WORLD_SIZE;
  enemy.ref!.style.transform = `translate3d(${newEnemyX}px, ${newEnemyY}px, 0)`;
}

export function updateOccupiedMatrix(enemyRect: Enemy["rect"]) {
  const offsetTilesY = bitwiseAbs(gameState.terrainRect.y) / TILE_SIZE;
  const offsetEnemyY = (enemyRect.y / TILE_SIZE) * 2;
  const offsetWorldY = (enemyRect.y / TILE_SIZE) * -1;
  const row = (offsetTilesY + offsetEnemyY + offsetWorldY + 1) | 0;

  const offsetTilesX = bitwiseAbs(gameState.terrainRect.x) / TILE_SIZE;
  const offsetEnemyX = (enemyRect.centerX / TILE_SIZE) * 2;
  const offsetWorldX = (enemyRect.x / TILE_SIZE) * -1;
  const col = (offsetTilesX + offsetEnemyX + offsetWorldX - 0.5) | 0;

  return { col: col < 0 ? 0 : col, row: row < 0 ? 0 : row };
}

export default function Enemies() {
  return (
    <For each={gameState.enemies}>
      {(enemy, idx) => (
        <Enemy idx={idx()} enemy={enemy} ref={(el) => setGameState("enemies", idx(), "ref", el)} />
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
  onMount(() => {
    setGameState(
      produce((state) => {
        const ref = state.enemies[props.idx]!.ref!;
        const boundingRect = ref.getBoundingClientRect();
        const rect = getInitialRect({
          width: boundingRect.width,
          height: boundingRect.height,
          ...(DEBUG
            ? {
                x: relativePlayerPos().centerX + -(state.enemies.length === 1 ? 200 : 350),
                y: relativePlayerPos().centerY + 0,
              }
            : {
                x: relativePlayerPos().centerX + getRandomBetween(500, 1500, true),
                y: relativePlayerPos().centerY + getRandomBetween(500, 1500, true),
              }),
        });
        const occupiedTile = updateOccupiedMatrix(rect);
        const nextTile = getNextTile(occupiedTile.row, occupiedTile.col);

        state.enemies[props.idx]!.dirX = getDirection(rect.centerX, relativePlayerPos().centerX);
        state.enemies[props.idx]!.dirY = getDirection(rect.centerY, relativePlayerPos().centerY);
        state.enemies[props.idx]!.rect = rect;
        state.enemies[props.idx]!.occupiedTile = occupiedTile;
        state.enemies[props.idx]!.nextTile = nextTile;
        state.occupiedTile[getTileInfoKey(occupiedTile.row, occupiedTile.col)] = 1;
        state.projectedTile[getTileInfoKey(nextTile.row, nextTile.col)] = 1;
      })
    );
  });

  createEffect(() => {
    switch (true) {
      case props.enemy.attackStatus === "hit": {
        setGameState("enemies", props.idx, "attackStatus", "cooldown");
        setTimeout(() => {
          if (gameState.enemies[props.idx]) {
            setGameState("enemies", props.idx, "attackStatus", "ready");
          }
        }, ENEMY_ATTACK_COOLDOWN);
        break;
      }

      case props.enemy.status === "hit": {
        setTimeout(() => {
          setGameState("enemies", props.idx, "status", "moving");
        }, BLOOD_ANIMATION_DURATION_SS * 1000);
        break;
      }

      case props.enemy.lifeStatus === "died": {
        console.log(123);
        setTimeout(
          () => {
            setGameState("enemies", props.idx, "lifeStatus", "show_skull");
            // setTimeout(() => {

            // });
          },
          (ENEMY_DIED_HIDE_MODEL_DURATION_SS * 1000) / 3
        );
        break;
      }
    }
  });

  createEffect(() => {
    console.log(props.enemy.status);
  });

  return (
    <div
      ref={props.ref}
      class={cn(
        "absolute h-enemy-hitbox w-enemy-hitbox",
        DEBUG && "border-blue-700 border-4",
        DEBUG &&
          gameState.occupiedTile[
            getTileInfoKey(props.enemy.occupiedTile.row, props.enemy.occupiedTile.col + 1)
          ]! &&
          "border-r-8 border-r-cyan-500",
        DEBUG &&
          gameState.occupiedTile[
            getTileInfoKey(props.enemy.occupiedTile.row, props.enemy.occupiedTile.col - 1)
          ]! &&
          "border-l-8 border-l-cyan-500",
        DEBUG &&
          gameState.occupiedTile[
            getTileInfoKey(props.enemy.occupiedTile.row - 1, props.enemy.occupiedTile.col)
          ]! &&
          "border-t-8 border-t-cyan-500",
        DEBUG &&
          gameState.occupiedTile[
            getTileInfoKey(props.enemy.occupiedTile.row + 1, props.enemy.occupiedTile.col)
          ]! &&
          "border-b-8 border-b-cyan-500"
      )}
    >
      <div
        class={cn(
          "relative left-1/2 top-1/2 h-enemy w-enemy -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-enemy will-change-bp [image-rendering:pixelated]",
          props.enemy.lifeStatus === "alive" &&
            props.enemy.status === "idle" &&
            "animate-move-sprite-sheet-enemy-idle",
          props.enemy.lifeStatus === "alive" &&
            props.enemy.status === "moving" &&
            "animate-move-sprite-sheet-enemy-run",
          props.enemy.lifeStatus === "alive" && props.enemy.dirX === -1 && "-scale-x-100",
          props.enemy.lifeStatus === "died" && "origin-[0_0] animate-hide-model rounded-full",
          props.enemy.lifeStatus === "show_skull" && "opacity-0"
        )}
      />

      <Switch>
        <Match when={props.enemy.status === "hit" || props.enemy.lifeStatus === "died"}>
          <BloodSpill dirX={props.enemy.dirX} dirY={props.enemy.dirY} />
        </Match>

        <Match when={props.enemy.lifeStatus === "show_skull"}>
          <Skull />
        </Match>
      </Switch>
    </div>
  );
}

function BloodSpill(props: Pick<Enemy, "dirX" | "dirY">) {
  return (
    <div
      style={{
        "--blood-scale": "1.2",
        "--blood-translate-x": `calc(-50% - (var(--blood-scale) * 20px * ${props.dirX}))`,
        "--blood-translate-y": `calc(-50% - (var(--blood-scale) * -20px * ${props.dirY}))`,
      }}
      class={cn(
        "absolute will-change-bp left-1/2 top-1/2 w-blood h-blood [background-position:0px_0px] [image-rendering:pixelated] translate-x-[--blood-translate-x] translate-y-[--blood-translate-y] bg-blood animate-blood-spill scale-[--blood-scale]",
        props.dirX === 1 && "-scale-x-[--blood-scale]"
      )}
    />
  );
}

function Skull() {
  return (
    <div
      style={{
        "background-position": `${SKULL_SIZE}px ${SKULL_SIZE}px`,
      }}
      class={cn(
        "absolute left-1/2 top-1/2 h-enemy w-enemy -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-skull will-change-bp [image-rendering:pixelated] animate-skull-appear"
      )}
    />
  );
}
