import { type PlayedGame } from '@/schema';
import { eventHandler } from 'vinxi/http';
import { continueGame, findActiveGame, startNewGame, updateGame } from '~/lib/api/games';
import { getSession } from '~/lib/api/sessions';
import { addCoinsToUser } from '~/lib/api/users';
import { encodeJson, parseEvent } from '~/utils';

export type GameServerEvent =
	| { type: 'ping'; ts: number }
	| { type: 'init_game_start' }
	| { type: 'game_start_confirmed'; game: PlayedGame }
	| { type: 'active_game_found'; game: PlayedGame }
	| { type: 'continue_game' }
	| { type: 'pause_game'; timePassedInMs: number }
	| { type: 'update_abruptly_stopped_game'; timePassedInMs: number }
	| { type: 'game_won' }
	| { type: 'game_lost'; timePassedInMs: number }
	| { type: 'reward_claimed' }
	| { type: 'abolish_game'; timePassedInMs: number }
	| { type: 'user_not_connected' };

function encodeEvent<T extends GameServerEvent>(event: T) {
	return encodeJson(event);
}

export default eventHandler({
	handler() {},
	websocket: {
		async open(peer) {
			console.log('User connected to WS server');
			const session = await getSession(peer.request as Request);
			if (!session) {
				peer.send(encodeEvent({ type: 'user_not_connected' }));
				return;
			}

			const activeGame = await findActiveGame(session.userId);
			if (activeGame) {
				peer.send(encodeEvent({ type: 'active_game_found', game: activeGame }));
			}
		},
		async message(peer, msg) {
			const session = await getSession(peer.request as Request);
			if (!session) return;

			const message = parseEvent(msg.text());
			if (!message) return;

			switch (message.type) {
				case 'ping': {
					peer.send(encodeEvent({ type: 'ping', ts: message.ts }));
					break;
				}

				case 'init_game_start': {
					console.log(123);
					const newGame = await startNewGame(session.userId);
					const encoded = encodeEvent({ type: 'game_start_confirmed', game: newGame });
					console.log(encoded);
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
						await updateGame(activeGame.id, {
							status: 'paused',
							currentlyAt: message.timePassedInMs,
						});
					}
					break;
				}

				case 'update_abruptly_stopped_game': {
					const activeGame = await findActiveGame(session.userId);
					if (activeGame) {
						const updatedGame = await updateGame(activeGame.id, {
							status: 'paused',
							currentlyAt: message.timePassedInMs,
						});
						peer.send(encodeEvent({ type: 'active_game_found', game: updatedGame }));
					}
					break;
				}

				case 'game_won': {
					const activeGame = await findActiveGame(session.userId);
					if (activeGame) {
						const updatedGame = await updateGame(activeGame.id, {
							status: 'won',
							currentlyAt: activeGame.timeLimit,
							finishedAt: new Date(),
							gameState: null,
						});
						await addCoinsToUser(session.userId, updatedGame.coinsAtStake);
						peer.send(encodeEvent({ type: 'reward_claimed' }));
					}
					break;
				}

				case 'game_lost': {
					const activeGame = await findActiveGame(session.userId);
					if (activeGame) {
						await updateGame(activeGame.id, {
							status: 'lost',
							currentlyAt: message.timePassedInMs,
							finishedAt: new Date(),
							gameState: null,
						});
					}
					break;
				}

				case 'abolish_game': {
					const activeGame = await findActiveGame(session.userId);
					if (activeGame) {
						await updateGame(activeGame.id, {
							status: 'aborted',
							currentlyAt: message.timePassedInMs,
							finishedAt: new Date(),
							gameState: null,
						});
					}
					break;
				}

				case 'reward_claimed':
				case 'game_start_confirmed':
				case 'active_game_found': {
					break;
				}
			}
		},
		async close(peer, details) {
			console.log('close');
		},
		async error(peer, error) {
			console.log('error', error);
		},
	},
});
