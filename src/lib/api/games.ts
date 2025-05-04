// 'use server';

// import { type PlayedGame, PlayedGames } from '@/schema';
// import { eq } from 'drizzle-orm';
// import { getRequestEvent } from 'solid-js/web';
// import { GAME_BASE_COINS_REWARD, GAME_TIME_IN_MINUTES } from '~/constants';
// import { getMins } from '~/utils';

// export async function startNewGame() {
//   const userId = getRequestEvent()?.locals.session?.userId;
//   if (!userId) {
//     throw new Error('somehow request to start a game was sent without an active user');
//   }

//   const [game] = await db
//     .insert(PlayedGames)
//     .values({
//       userId,
//       status: 'in_progress',
//       timeLimit: getMins(GAME_TIME_IN_MINUTES),
//       coinsAtStake: GAME_BASE_COINS_REWARD,
//     })
//     .returning();
//   return game!;
// }

// export async function continueGame() {
//   const gameId = getRequestEvent()?.locals.session?.gameId;
//   if (!gameId) {
//     throw new Error('somehow request to continue a game was sent without an active game');
//   }

//   const [game] = await db
//     .update(PlayedGames)
//     .set({ status: 'in_progress' })
//     .where(eq(PlayedGames.id, gameId))
//     .returning();
//   return game!;
// }

// export async function updateGame(data: Partial<Omit<PlayedGame, 'id'>>) {
//   const gameId = getRequestEvent()?.locals.session?.gameId;
//   if (!gameId) {
//     throw new Error('somehow request to continue a game was sent without an active game');
//   }

//   const [game] = await db
//     .update(PlayedGames)
//     .set(data)
//     .where(eq(PlayedGames.id, gameId))
//     .returning();
//   return game!;
// }
