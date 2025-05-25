import { api } from "@/convex/_generated/api";
import type { DataModel, Id } from "@/convex/_generated/dataModel";
import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "@zod/mini";
import { on } from "events";
import SuperJSON from "superjson";
import type { CreateBunContextOptions } from "trpc-bun-adapter";
import Game, { type PublicGameState } from "~/lib/classes/Game";
import convexClient from "~/lib/convexClient";

export type Context = Awaited<ReturnType<typeof createContext>>;
export async function createContext(opts: Partial<CreateBunContextOptions>) {
  return opts;
}

const t = initTRPC.context<Context>().create({ transformer: SuperJSON });
export type AppRouter = typeof appRouter;

const ACTIVE_GAMES: Record<Id<"games">, Game> = {};

const playerProcedure = t.procedure
  .input(z.object({ playerName: z.string().check(z.minLength(1)) }))
  .use(async ({ next, input }) => {
    let currentGame: DataModel["games"]["document"] | null = null;
    const [existingGame] = await convexClient.query(api.games.getGame, {});
    if (!existingGame) {
      currentGame = await convexClient.mutation(api.games.createGame, {
        players: { [input.playerName]: { name: input.playerName, pos: { x: 0, y: 0 } } },
      });
      if (!currentGame) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Game error occured while creating the game",
        });
      }
    } else {
      currentGame = existingGame;
    }

    if (!ACTIVE_GAMES[currentGame._id]) {
      ACTIVE_GAMES[currentGame._id] = new Game(currentGame);
    }

    const activeGame = ACTIVE_GAMES[currentGame._id]!;

    return next({
      ctx: {
        currentGame: activeGame,
        player: await activeGame.getPlayer(input.playerName),
      },
    });
  });

export const appRouter = t.router({
  player: {
    initialPos: playerProcedure.query(({ ctx }) => ctx.player.pos),
    keyPressed: playerProcedure
      .input(
        z.interface({
          keys: z.interface({ w: z.boolean(), s: z.boolean(), a: z.boolean(), d: z.boolean() }),
        })
      )
      .mutation(({ input, ctx }) => {
        if (ctx.currentGame.isPaused) ctx.currentGame.start();
        ctx.player.keyPressed = input.keys;
      }),
  },

  worldState: playerProcedure.subscription(async function* ({ signal, ctx }) {
    for await (const [data] of on(ctx.currentGame.ee, "worldState", { signal })) {
      yield data as PublicGameState;
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
