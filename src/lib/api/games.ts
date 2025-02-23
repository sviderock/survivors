'use server';

import { type PlayedGame, PlayedGames, type UserType } from '@/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { BASE_COINS_REWARD, STAGE_TIME_IN_MINUTES } from '~/constants';
import { db } from '~/db';
import { getMins } from '~/utils';

export async function startNewGame(userId: UserType['id']) {
	const [game] = await db
		.insert(PlayedGames)
		.values({
			userId,
			status: 'in_progress',
			timeLimit: getMins(STAGE_TIME_IN_MINUTES),
			coinsAtStake: BASE_COINS_REWARD,
		})
		.returning();
	return game!;
}

export async function continueGame(gameId: PlayedGame['id']) {
	const [game] = await db
		.update(PlayedGames)
		.set({ status: 'in_progress' })
		.where(eq(PlayedGames.id, gameId))
		.returning();
	return game!;
}

export async function findActiveGame(userId: UserType['id']) {
	const [game] = await db
		.select()
		.from(PlayedGames)
		.where(
			and(eq(PlayedGames.userId, userId), inArray(PlayedGames.status, ['in_progress', 'paused'])),
		);
	return game;
}

export async function updateGame(gameId: PlayedGame['id'], data: Partial<Omit<PlayedGame, 'id'>>) {
	const [game] = await db
		.update(PlayedGames)
		.set(data)
		.where(eq(PlayedGames.id, gameId))
		.returning();
	return game!;
}
