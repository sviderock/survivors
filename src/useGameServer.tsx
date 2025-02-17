import { createReconnectingWS, type ReconnectingWebSocket } from '@solid-primitives/websocket';
import { onCleanup, onMount } from 'solid-js';
import { produce } from 'solid-js/store';
import { isServer } from 'solid-js/web';
import { gameState, setGameState, setPing, setStageTimer, stageTimer } from '~/state';
import { encodeJson, getWsUrl, parseJson } from '~/utils';
import type { GameServerEvent, PauseGameEvent, PingEvent } from '~/ws';

export let gameServer: ReconnectingWebSocket | null;

export default function useGameServer() {
	gameServer = isServer ? null : createReconnectingWS(getWsUrl(location));

	onMount(() => {
		if (!gameServer) return;

		let pingInterval: NodeJS.Timeout | undefined;

		gameServer.addEventListener('open', () => {
			// pingInterval = setInterval(() => {
			// 	gameServer!.send(encodeJson<PingEvent>({ type: 'ping', ts: Date.now() }));
			// }, 1000);
		});

		gameServer.addEventListener('message', (event) => {
			const message = parseJson(event.data) as GameServerEvent;

			switch (message.type) {
				case 'ping': {
					setPing(Date.now() - message.ts);
					break;
				}

				case 'game_start_confirmed': {
					if (message.game.status === 'in_progress') {
						setGameState('status', 'in_progress');
					}
					break;
				}

				case 'active_game_found': {
					setGameState(
						produce((state) => {
							state.status = 'active_game_found';
							state.gameInstance = message.game;
						}),
					);
					setStageTimer(message.game.currentlyAt);

					break;
				}
			}
		});

		gameServer.addEventListener('close', (event) => {
			if (gameState.status === 'in_progress') {
				setGameState('status', 'paused');
				gameServer!.send(
					encodeJson<PauseGameEvent>({ type: 'pause_game', timePassedInMs: stageTimer() }),
				);
			}
			if (pingInterval) clearInterval(pingInterval);
			setPing(0);
		});

		gameServer.addEventListener('error', (error) => {
			if (pingInterval) clearInterval(pingInterval);
			// console.error('WebSocket encountered an error:', error);
		});

		// Clean up when the component unmounts
		onCleanup(() => {
			gameServer?.close();
			if (pingInterval) clearInterval(pingInterval);
		});
	});

	return gameServer;
}
