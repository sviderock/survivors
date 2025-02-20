'use server';
import { UserAddresses, Users, type UserType } from '@/schema';
import { type APIEvent } from '@solidjs/start/server';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '~/db';
import { checkQuestsForUser } from '~/routes/api/quests';
import { createSession, getSession } from '~/routes/api/sessions';

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

export type PostUsers = Awaited<ReturnType<typeof POST>>;
export async function POST({ request, response }: APIEvent) {
	const session = await getSession(request);

	// if session is present then we can get user by id
	if (session) {
		const user = await db.query.Users.findFirst({
			where: eq(Users.id, session.userId),
			with: { addresses: true },
		});
		if (!user) throw new Error('User not found');

		void checkQuestsForUser(user.id);
		return user;
	}

	const reqBody = (await request.json()) as { addresses: string[] };
	if (!reqBody.addresses.length) throw new Error('No addresses provided');

	// // otherwise check if user with such addresses already exists
	const userByAddresses = await db.query.Users.findFirst({
		where: (users, { exists }) =>
			exists(
				db
					.select()
					.from(UserAddresses)
					.where(
						and(
							eq(UserAddresses.userId, users.id),
							inArray(UserAddresses.address, reqBody.addresses),
						),
					),
			),
		with: {
			addresses: true,
		},
	});

	if (userByAddresses) {
		await createSession(userByAddresses.id, response);
		return userByAddresses;
	}

	const newUser = await db.transaction(async (tx) => {
		const [user] = await tx.insert(Users).values({}).returning();
		const addresses = await tx
			.insert(UserAddresses)
			.values(reqBody.addresses.map((address) => ({ userId: user!.id, address })))
			.returning();
		return { ...user!, addresses };
	});
	await createSession(newUser.id, response);
	return newUser;
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
