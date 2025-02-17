import { createReconnectingWS, type ReconnectingWebSocket } from '@solid-primitives/websocket';
import { onCleanup, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';
import { setGameState, setPing } from '~/state';
import { encodeJson, getWsUrl, parseJson } from '~/utils';
import type { GameServerEvent } from '~/ws';

export let gameServer: ReconnectingWebSocket | null;

export default function useGameServer() {
	gameServer = isServer ? null : createReconnectingWS(getWsUrl(location));

	onMount(() => {
		if (!gameServer) return;

		let pingInterval: NodeJS.Timeout;

		gameServer.addEventListener('open', () => {
			pingInterval = setInterval(() => {
				gameServer!.send(encodeJson({ type: 'ping', ts: Date.now() }));
			}, 1000);
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
				}
			}
		});

		gameServer.addEventListener('close', (event) => {
			clearInterval(pingInterval);
			setPing(0);
		});

		gameServer.addEventListener('error', (error) => {
			clearInterval(pingInterval);
			// console.error('WebSocket encountered an error:', error);
		});

		// Clean up when the component unmounts
		onCleanup(() => {
			gameServer?.close();
			clearInterval(pingInterval);
		});
	});

	return gameServer;
}
