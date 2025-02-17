import type { PlayedGame } from '@/schema';
import { getRequestEvent } from 'solid-js/web';
import { eventHandler } from 'vinxi/http';
import { continueGame, findActiveGame, pauseGame, startNewGame } from '~/routes/api/games';
import { getSession } from '~/routes/api/sessions';
import { encodeJson, parseJson } from '~/utils';

export type PingEvent = { type: 'ping'; ts: number };
export type GameStartConfirmedEvent = { type: 'game_start_confirmed'; game: PlayedGame };
export type ActiveGameFoundEvent = { type: 'active_game_found'; game: PlayedGame };
export type ContinueGameEvent = { type: 'continue_game' };
export type PauseGameEvent = { type: 'pause_game'; timePassedInMs: number };

export type GameServerEvent =
	| PingEvent
	| { type: 'init_game_start' }
	| GameStartConfirmedEvent
	| ActiveGameFoundEvent
	| ContinueGameEvent
	| PauseGameEvent;

export default eventHandler({
	handler() {},
	websocket: {
		async open(peer) {
			console.log('User connected!');
			const session = await getSession(peer.request as Request);
			if (!session) return;

			const activeGame = await findActiveGame(session.userId);
			if (activeGame) {
				peer.send(
					encodeJson<ActiveGameFoundEvent>({ type: 'active_game_found', game: activeGame }),
				);
			}
		},
		async message(peer, msg) {
			const session = await getSession(peer.request as Request);
			if (!session) return;

			const message = parseJson(msg.text()) as GameServerEvent;

			switch (message.type) {
				case 'ping': {
					peer.send(encodeJson<PingEvent>({ type: 'ping', ts: message.ts }));
					break;
				}

				case 'init_game_start': {
					const newGame = await startNewGame(session.userId);
					const encoded = encodeJson<GameServerEvent>({
						type: 'game_start_confirmed',
						game: newGame,
					});
					if (encoded) {
						peer.send(encoded);
					}
					break;
				}

				case 'continue_game': {
					const activeGame = await findActiveGame(session.userId);

					if (activeGame) {
						await continueGame(activeGame.id);
					}
					break;
				}

				case 'pause_game': {
					const activeGame = await findActiveGame(session.userId);
					if (activeGame) {
						await pauseGame({ id: activeGame.id, currentlyAt: message.timePassedInMs });
					}
					break;
				}

				case 'game_start_confirmed':
				case 'active_game_found': {
					break;
				}
			}
		},
		async close(peer, details) {
			console.log('close', peer.id);
		},
		async error(peer, error) {
			console.log('error', peer.id, error);
		},
	},
});
