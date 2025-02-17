import type { PlayedGame } from '@/schema';
import { eventHandler } from 'vinxi/http';
import { startNewGame } from '~/routes/api/games';
import { getSession } from '~/routes/api/sessions';
import { encodeJson, parseJson } from '~/utils';

export type GameStartConfirmedEvent = { type: 'game_start_confirmed'; game: PlayedGame };

export type GameServerEvent =
	| { type: 'ping'; ts: number }
	| { type: 'init_game_start' }
	| GameStartConfirmedEvent;

export default eventHandler({
	handler() {},
	websocket: {
		async open(peer) {
			console.log('User connected!');
		},
		async message(peer, msg) {
			const session = await getSession(peer.request as Request);
			if (!session) return;

			const message = parseJson(msg.text());
			switch (message.type as GameServerEvent['type']) {
				case 'ping': {
					peer.send(msg.text());
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

				case 'game_start_confirmed': {
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
