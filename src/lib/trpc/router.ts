import { initTRPC } from "@trpc/server";
import { on } from "events";
import SuperJSON from "superjson";
import type { CreateBunContextOptions } from "trpc-bun-adapter";
import { z } from "zod";
import Game, { type GameServerState } from "~/lib/classes/Game";

export type Context = Awaited<ReturnType<typeof createContext>>;
export async function createContext(opts: Partial<CreateBunContextOptions>) {
  return opts;
}

const t = initTRPC.context<Context>().create({ transformer: SuperJSON });

export type AppRouter = typeof appRouter;

const game = new Game();
// game.start();

export const appRouter = t.router({
  player: {
    keyPressed: t.procedure
      .input(
        z.interface({
          w: z.boolean(),
          s: z.boolean(),
          a: z.boolean(),
          d: z.boolean(),
        })
      )
      .mutation(({ input }) => {
        if (game.isPaused) {
          game.start();
        }

        game.getPlayer(0).keyPressed = input;
      }),
  },

  worldState: t.procedure.subscription(async function* (opts) {
    for await (const [data] of on(game.ee, "worldState", {
      signal: opts.signal,
    })) {
      yield data as GameServerState;
    }
  }),
});

// export type GameServerEvent =
//   | { type: 'ping'; ts: number }
//   | { type: 'init_game_start' }
//   | { type: 'game_start_confirmed'; game: PlayedGame }
//   | { type: 'active_game_found'; game: PlayedGame }
//   | { type: 'continue_game' }
//   | { type: 'pause_game'; timePassedInMs: number }
//   | { type: 'update_abruptly_stopped_game'; timePassedInMs: number }
//   | { type: 'game_won' }
//   | { type: 'game_lost'; timePassedInMs: number }
//   | { type: 'reward_claimed' }
//   | { type: 'abolish_game'; timePassedInMs: number }
//   | { type: 'user_not_connected' };

// function encodeEvent<T extends GameServerEvent>(event: T) {
//   return encodeJson(event);
// }

// export default eventHandler({
//   handler() {},
//   websocket: {
//     async open(peer) {
//       console.log('User connected to WS server');
//       const session = getRequestEvent()?.locals.session;
//       if (!session) {
//         peer.send(encodeEvent({ type: 'user_not_connected' }));
//         return;
//       }

//       const activeGame = getRequestEvent()!.locals.activeGame;
//       if (activeGame) {
//         peer.send(encodeEvent({ type: 'active_game_found', game: activeGame }));
//       }
//     },
//     async message(peer, msg) {
//       const session = getRequestEvent()?.locals.session;
//       if (!session) return;

//       const message = parseEvent(msg.text());
//       if (!message) return;

//       switch (message.type) {
//         case 'ping': {
//           peer.send(encodeEvent({ type: 'ping', ts: message.ts }));
//           break;
//         }

//         case 'init_game_start': {
//           const newGame = await startNewGame();
//           const encoded = encodeEvent({ type: 'game_start_confirmed', game: newGame });
//           if (encoded) {
//             peer.send(encoded);
//           }
//           break;
//         }

//         case 'continue_game': {
//           await continueGame();
//           break;
//         }

//         case 'pause_game': {
//           await updateGame({ status: 'paused', currentlyAt: message.timePassedInMs });
//           break;
//         }

//         case 'update_abruptly_stopped_game': {
//           const updatedGame = await updateGame({
//             status: 'paused',
//             currentlyAt: message.timePassedInMs,
//           });
//           peer.send(encodeEvent({ type: 'active_game_found', game: updatedGame }));
//           break;
//         }

//         case 'game_won': {
//           const updatedGame = await updateGame({
//             status: 'won',
//             finishedAt: new Date(),
//             gameState: null,
//           });
//           await db.update(Users).set({ coins: sql`${Users.coins} + ${updatedGame.coinsAtStake}` });
//           peer.send(encodeEvent({ type: 'reward_claimed' }));
//           break;
//         }

//         case 'game_lost': {
//           await updateGame({
//             status: 'lost',
//             currentlyAt: message.timePassedInMs,
//             finishedAt: new Date(),
//             gameState: null,
//           });
//           break;
//         }

//         case 'abolish_game': {
//           await updateGame({
//             status: 'aborted',
//             currentlyAt: message.timePassedInMs,
//             finishedAt: new Date(),
//             gameState: null,
//           });
//           break;
//         }

//         case 'user_not_connected':
//         case 'reward_claimed':
//         case 'game_start_confirmed':
//         case 'active_game_found': {
//           break;
//         }
//       }
//     },
//     async close(_peer, _details) {
//       console.log('close');
//     },
//     async error(_peer, error) {
//       console.log('error');
//       console.error(error);
//     },
//   },
// });
