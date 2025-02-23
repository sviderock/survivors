'use server';
import { Users, type UserType } from '@/schema';
import { type APIEvent } from '@solidjs/start/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '~/db';
import { getSession } from '~/lib/api/sessions';

export async function updateUser(userId: UserType['id'], data: Partial<Omit<UserType, 'id'>>) {
	const [user] = await db.update(Users).set(data).where(eq(Users.id, userId)).returning();
	return user!;
}

export async function addCoinsToUser(userId: UserType['id'], coins: UserType['coins']) {
	const [user] = await db
		.update(Users)
		.set({ coins: sql`${Users.coins} + ${coins}` })
		.where(eq(Users.id, userId))
		.returning();
	return user!;
}

export type PatchUsersBody = Omit<Partial<UserType>, 'id'>;
export type PatchUsers = Awaited<ReturnType<typeof PATCH>>;
export async function PATCH({ request }: APIEvent) {
	const session = await getSession(request);
	if (!session) throw new Error('No session for user?');

	const typedParams = (await request.json()) as PatchUsersBody;
	return db
		.update(Users)
		.set({
			coins: typedParams.coins,
			divviRegistration: typedParams.divviRegistration,
		})
		.where(eq(Users.id, session.userId))
		.returning();
}
