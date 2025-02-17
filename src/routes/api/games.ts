'use server';

import { PlayedGames, type UserType } from '@/schema';
import { db } from '~/db';
import { getMins } from '~/utils';

export async function startNewGame(userId: UserType['id']) {
	const [game] = await db
		.insert(PlayedGames)
		.values({ userId, status: 'in_progress', timeLimit: getMins(5) })
		.returning();
	return game!;
}
