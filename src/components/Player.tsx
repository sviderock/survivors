import { batch, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createStore, produce } from "solid-js/store";
import HealthBar from "~/components/HealthBar";
import { getTileInfoKey } from "~/components/Terrain";
import { spawnArrow } from "~/components/weapons/Arrows";
import {
  DIAGONAL_SPEED,
  GAME_WORLD_SIZE,
  PLAYER_BASE_COOLDOWN,
  PLAYER_BASE_HEALTH,
  PLAYER_SIZE,
  PLAYER_SPEED,
  RAPID_MODE,
  SHOOTING_ANIMATION_DURATION_SS,
  TILE_SIZE,
  XP_LVL_2,
  XP_LVL_21_TO_40,
  XP_LVL_3_TO_20,
  XP_LVL_41_AND_UP,
} from "~/constants";
import { keyPressed } from "~/lib/keyboardEvents";
import { gameState, setGameState, setWorldRect, worldRect } from "~/state";
import { bitwiseAbs, cn, getInitialRect, getNewPos, getRect } from "~/utils";

const [lastDir, setLastDir] = createSignal(0);
const dirs: AttackingDirection[] = [
  "east",
  "south-east",
  "south",
  "south-west",
  "west",
  "north-west",
  "north",
  "north-east",
];

export const [playerRect, setPlayerRect] = createSignal(
  getInitialRect({ x: 0, y: 0, width: PLAYER_SIZE, height: PLAYER_SIZE })
);
export const [player, setPlayer] = createStore<Player>({
  ref: undefined,
  health: PLAYER_BASE_HEALTH,
  maxHealth: PLAYER_BASE_HEALTH,
  movement: "idle",
  direction: "west",
  occupiedTile: { row: 0, col: 0 },
  attack: {
    status: "ready",
    direction: "west",
    cooldown: RAPID_MODE ? 10 : PLAYER_BASE_COOLDOWN,
  },
});

export const relativePlayerPos = () => ({
  left: playerRect().left - worldRect.x,
  right: playerRect().right - worldRect.x,
  top: playerRect().top - worldRect.y,
  bottom: playerRect().bottom - worldRect.y,
  centerX: playerRect().left - worldRect.x + playerRect().width / 2,
  centerY: playerRect().top - worldRect.y + playerRect().height / 2,
});

export const playerLevel = () => {
  if (gameState.experience < XP_LVL_2) {
    return { level: 1, exp: gameState.experience, xpToNextLevel: XP_LVL_2 };
  }

  if (gameState.experience === XP_LVL_2) {
    return {
      level: 2,
      exp: gameState.experience - XP_LVL_2,
      xpToNextLevel: XP_LVL_2 + XP_LVL_3_TO_20,
    };
  }

  let accumulatedXP = gameState.experience - XP_LVL_2;
  let level = 2;
  let xpIncrease = XP_LVL_3_TO_20;
  let xpToNextLevel = XP_LVL_2 + XP_LVL_3_TO_20;
  while (accumulatedXP > 0) {
    if (accumulatedXP < xpToNextLevel) break;

    level++;
    if (level >= 20 && level < 40) {
      xpIncrease = XP_LVL_21_TO_40;
    } else if (level >= 40) {
      xpIncrease = XP_LVL_41_AND_UP;
    }

    accumulatedXP -= xpToNextLevel;
    xpToNextLevel += xpIncrease;
  }

  return { level, xpToNextLevel, exp: accumulatedXP };
};

export function movePlayer() {
  if (!keyPressed.w && !keyPressed.s && !keyPressed.a && !keyPressed.d) {
    return { newWorldX: worldRect.x, newWorldY: worldRect.y };
  }

  const playerSpeedModifier =
    (keyPressed.w && keyPressed.a) ||
    (keyPressed.w && keyPressed.d) ||
    (keyPressed.s && keyPressed.a) ||
    (keyPressed.s && keyPressed.d)
      ? DIAGONAL_SPEED
      : 1;

  let newWorldX = worldRect.x;
  let newWorldY = worldRect.y;
  if (keyPressed.w) newWorldY += (PLAYER_SPEED * playerSpeedModifier) | 0;
  if (keyPressed.s) newWorldY -= (PLAYER_SPEED * playerSpeedModifier) | 0;
  if (keyPressed.a) newWorldX += (PLAYER_SPEED * playerSpeedModifier) | 0;
  if (keyPressed.d) newWorldX -= (PLAYER_SPEED * playerSpeedModifier) | 0;

  const { row, col } = updateOccupiedMatrix(playerRect().x + newWorldX, playerRect().y + newWorldY);

  batch(() => {
    setWorldRect(
      getNewPos({ x: newWorldX, y: newWorldY, width: GAME_WORLD_SIZE, height: GAME_WORLD_SIZE })
    );

    if (player.occupiedTile.row !== row || player.occupiedTile.col !== col) {
      setGameState(
        "occupiedTile",
        produce((occupiedTile) => {
          occupiedTile[getTileInfoKey(player.occupiedTile.row, player.occupiedTile.col)] =
            undefined;
          occupiedTile[getTileInfoKey(row, col)] = 1;
        })
      );
      setPlayer("occupiedTile", { row, col });
    }
  });

  return { newWorldX, newWorldY };
}

function updateOccupiedMatrix(targetX: number, targetY: number) {
  const offsetTilesY = bitwiseAbs(gameState.terrainRect.y) / TILE_SIZE;
  const offsetPlayerY = (bitwiseAbs(playerRect().y) / TILE_SIZE) * 2;
  const offsetWorldY = (targetY / TILE_SIZE) * -1;
  const row = (offsetTilesY + offsetPlayerY + offsetWorldY + 1) | 0;

  const offsetTilesX = bitwiseAbs(gameState.terrainRect.x) / TILE_SIZE;
  const offsetPlayerX = (bitwiseAbs(playerRect().x) / TILE_SIZE) * 2;
  const offsetWorldX = (targetX / TILE_SIZE) * -1;
  const col = (offsetTilesX + offsetPlayerX + offsetWorldX + 0.5) | 0;

  return { col: col < 0 ? 0 : col, row: row < 0 ? 0 : row };
}

export default function Player() {
  onMount(() => {
    const rect = { ...getRect(player.ref!), width: PLAYER_SIZE, height: PLAYER_SIZE };
    setPlayerRect(rect);

    const lastOccupied = updateOccupiedMatrix(rect.x + worldRect.x, rect.y + worldRect.y);
    setPlayer("occupiedTile", lastOccupied);
    setGameState("occupiedTile", getTileInfoKey(lastOccupied.row, lastOccupied.col), 1);
  });

  createEffect(() => {
    let attackTimeout: NodeJS.Timeout;
    if (player.attack.status === "started_attack") {
      attackTimeout = setTimeout(
        () => {
          batch(() => {
            if (RAPID_MODE) {
              spawnArrow(dirs[lastDir()]!);
              setLastDir((d) => (d === 7 ? 0 : d + 1));
              setPlayer("attack", "status", "cooldown");
            }
          });
        },
        (RAPID_MODE ? SHOOTING_ANIMATION_DURATION_SS : 10) * 1000
      );
    }

    onCleanup(() => {
      clearTimeout(attackTimeout);
    });
  });

  createEffect(() => {
    let cooldownTimeout: NodeJS.Timeout;
    if (player.attack.status === "cooldown") {
      cooldownTimeout = setTimeout(() => {
        setPlayer("attack", "status", "ready");
      }, player.attack.cooldown);
    }

    onCleanup(() => {
      clearTimeout(cooldownTimeout);
    });
  });

  return (
    <div class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
      <div ref={(ref) => setPlayer("ref", ref)} class="relative h-player-hitbox w-player-hitbox">
        <div
          class={cn(
            "relative left-1/2 top-1/2 h-player w-player -translate-x-1/2 -translate-y-1/2 animate-move-sprite-sheet-idle overflow-hidden bg-player will-change-bp [image-rendering:pixelated]",
            player.direction === "west" && "-scale-x-100",
            player.movement === "moving" && "animate-move-sprite-sheet-run",
            player.attack.status === "started_attack" &&
              player.attack.direction === "north-west" &&
              "-scale-x-100 animate-move-sprite-sheet-shoot-north-east",
            player.attack.status === "started_attack" &&
              player.attack.direction === "north" &&
              "animate-move-sprite-sheet-shoot-north",
            player.attack.status === "started_attack" &&
              player.attack.direction === "north-east" &&
              "animate-move-sprite-sheet-shoot-north-east",
            player.attack.status === "started_attack" &&
              player.attack.direction === "east" &&
              "animate-move-sprite-sheet-shoot-east",
            player.attack.status === "started_attack" &&
              player.attack.direction === "south-east" &&
              "animate-move-sprite-sheet-shoot-south-east",
            player.attack.status === "started_attack" &&
              player.attack.direction === "south" &&
              "animate-move-sprite-sheet-shoot-south",
            player.attack.status === "started_attack" &&
              player.attack.direction === "south-west" &&
              "-scale-x-100 animate-move-sprite-sheet-shoot-south-east",
            player.attack.status === "started_attack" &&
              player.attack.direction === "west" &&
              "-scale-x-100 animate-move-sprite-sheet-shoot-east"
          )}
        />
      </div>

      <HealthBar class="mt-1 h-3" currentHealth={player.health} maxHealth={player.maxHealth} />
    </div>
  );
}
