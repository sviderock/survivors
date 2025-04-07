import { batch, createSignal } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { setPlayer } from '~/components/Player';
import { setStageTimer } from '~/components/StageTimer';
import { GAME_WORLD_SIZE, PLAYER_BASE_COOLDOWN, PLAYER_BASE_HEALTH } from '~/constants';
import { setKeyPressed } from '~/lib/keyboardEvents';
import { getInitialRect } from '~/utils';

function getInitialGameState(): GameState {
  return {
    pingEnabled: false,
    enemySpawnInterval: 0,
    experience: 0,
    enemiesKilled: 0,
    status: 'not_started',
    enemies: [],
    arrows: [],
    gems: [],
    activeGame: null,
    terrainRect: getInitialRect({
      x: -GAME_WORLD_SIZE / 2,
      y: -GAME_WORLD_SIZE / 2,
      width: GAME_WORLD_SIZE,
      height: GAME_WORLD_SIZE,
    }),
    occupiedTile: {},
    projectedTile: {},
  };
}

export const [worldRect, setWorldRect] = createStore(
  getInitialRect({ x: 0, y: 0, width: GAME_WORLD_SIZE, height: GAME_WORLD_SIZE }),
);
export const [gameState, setGameState] = createStore<GameState>(getInitialGameState());
export const [ping, setPing] = createSignal(0);

export function resetGameState() {
  batch(() => {
    setGameState(getInitialGameState());
    setKeyPressed({ w: false, s: false, a: false, d: false });
    setStageTimer(0);
    setPlayer(
      produce((player) => {
        player.health = PLAYER_BASE_HEALTH;
        player.maxHealth = PLAYER_BASE_HEALTH;
        player.movement = 'idle';
        player.direction = 'east';
        player.attack = {
          status: 'ready',
          direction: 'east',
          cooldown: PLAYER_BASE_COOLDOWN,
        };
      }),
    );
  });
}
