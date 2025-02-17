'use server';

import { PlayedGame, PlayedGames, type UserType } from '@/schema';
import { and, eq, inArray, or } from 'drizzle-orm';
import { db } from '~/db';
import { getMins } from '~/utils';

export async function startNewGame(userId: UserType['id']) {
	const [game] = await db
		.insert(PlayedGames)
		.values({ userId, status: 'in_progress', timeLimit: getMins(5) })
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

export async function pauseGame(game: Pick<PlayedGame, 'id' | 'currentlyAt'>) {
	await db
		.update(PlayedGames)
		.set({ status: 'paused', currentlyAt: game.currentlyAt })
		.where(eq(PlayedGames.id, game.id));
}
