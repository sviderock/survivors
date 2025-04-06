import { type ReconnectingWebSocket, createReconnectingWS } from '@solid-primitives/websocket';
import { createEffect, onCleanup, onMount } from 'solid-js';
import { produce } from 'solid-js/store';
import { isServer } from 'solid-js/web';
import { setStageTimer, stageTimer } from '~/components/StageTimer';
import { ABRUPTLY_STOPPPED_GAME_LS_KEY } from '~/constants';
import { currentUser } from '~/lib/currentUser';
import { gameState, setGameState, setPing } from '~/state';
import { encodeJson, getPersistedData, getWsUrl, parseEvent, persistData } from '~/utils';
import { type GameServerEvent } from '~/ws';

let pingInterval: NodeJS.Timeout | undefined;
export let gameServer: ReconnectingWebSocket | null;

export function sendWS<T extends GameServerEvent>(event: T) {
  gameServer?.send(encodeJson(event));
}

function resetPingInterval() {
  clearInterval(pingInterval);
  pingInterval = undefined;
  setPing(0);
}

export function setupGameServerConnection() {
  const { user } = currentUser();
  gameServer = isServer ? null : createReconnectingWS(getWsUrl(location));

  createEffect(() => {
    if (gameState.pingEnabled && gameServer) {
      pingInterval = setInterval(() => sendWS({ type: 'ping', ts: Date.now() }), 1000);
      return;
    }

    resetPingInterval();
  });

  onMount(() => {
    if (!gameServer) return;
    gameServer.addEventListener('open', () => {
      const abruptlyStoppedGame = getPersistedData<{ timePassedInMs: number }>(
        ABRUPTLY_STOPPPED_GAME_LS_KEY,
      );
      if (abruptlyStoppedGame) {
        sendWS({
          type: 'update_abruptly_stopped_game',
          timePassedInMs: abruptlyStoppedGame.timePassedInMs,
        });
      }
    });

    gameServer.addEventListener('message', (event) => {
      const gameEvent = parseEvent(event.data);
      if (!gameEvent) return;

      switch (gameEvent.type) {
        case 'ping': {
          setPing(Date.now() - gameEvent.ts);
          break;
        }

        case 'game_start_confirmed': {
          if (gameEvent.game.status === 'in_progress') {
            setGameState(
              produce((state) => {
                state.status = 'in_progress';
                state.activeGame = gameEvent.game;
              }),
            );
            setStageTimer(gameEvent.game.currentlyAt);
          }
          break;
        }

        case 'active_game_found': {
          setGameState(
            produce((state) => {
              state.status = 'active_game_found';
              state.activeGame = gameEvent.game;
            }),
          );
          setStageTimer(gameEvent.game.currentlyAt);
          break;
        }

        case 'reward_claimed': {
          user.refetch();
          break;
        }

        case 'user_not_connected': {
          break;
        }
      }
    });

    gameServer.addEventListener('close', (_event) => {
      if (gameState.status === 'in_progress') {
        setGameState('status', 'paused');
        persistData(ABRUPTLY_STOPPPED_GAME_LS_KEY, { timePassedInMs: stageTimer() });
      }
      setGameState('pingEnabled', false);
    });

    gameServer.addEventListener('error', (_error) => {
      setGameState('pingEnabled', false);
    });

    // Clean up when the component unmounts
    onCleanup(() => {
      gameServer?.close();
      resetPingInterval();
    });
  });

  return gameServer;
}
