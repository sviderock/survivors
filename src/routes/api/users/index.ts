'use server';
import { UserAddresses, Users, type UserType } from '@/schema';
import { type APIEvent } from '@solidjs/start/server';
import { eq, inArray, sql } from 'drizzle-orm';
import { readIsRegistered } from '~/blockchain/divvi';
import { db } from '~/db';
import { checkQuestsForUser } from '~/routes/api/quests';
import { createSession, getSession } from '~/routes/api/sessions';

async function getUserById<T extends string | undefined = undefined>(id: number, throwMsg?: T) {
	const [user] = await db.select().from(Users).where(eq(Users.id, id));
	if (!user && throwMsg) throw new Error(throwMsg);
	const typedUser = user as UserType | (T extends string ? never : undefined);

	if (typedUser) void checkQuestsForUser(typedUser.id);

	// await readIsRegistered();
	return typedUser;
}

async function getUserByAddresses<T extends string | undefined = undefined>(
	addresses: string[],
	throwMsg?: T,
) {
	const wallet = await db.query.UserAddresses.findFirst({
		where: inArray(UserAddresses.address, addresses),
		with: {
			user: true,
		},
	});
	if (!wallet?.user && throwMsg) throw new Error(throwMsg);
	return wallet?.user as UserType | (T extends string ? never : undefined);
}

async function createUser(addresses: string[]) {
	if (!addresses.length) throw new Error('Addresses are absent');

	const newUserId = await db.transaction(async (tx) => {
		const [user] = await tx.insert(Users).values({}).returning();
		await tx
			.insert(UserAddresses)
			.values(addresses.map((address) => ({ userId: user!.id, address })));
		return user!;
	});

	if (!newUserId) throw new Error('User cannot be created');
	return newUserId;
}

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

export async function POST({ request, response }: APIEvent) {
	const session = await getSession(request);

	// if session is present then we can get user by id
	if (session) {
		return getUserById(session.userId, 'User not found');
	}

	const reqBody = (await request.json()) as { addresses: string[] };
	if (!reqBody.addresses.length) throw new Error('No addresses provided');

	// // otherwise check if user with such addresses already exists
	const userByAddresses = await getUserByAddresses(reqBody.addresses);
	if (userByAddresses) {
		await createSession(userByAddresses.id, response);
		return userByAddresses;
	}

	// if there are no user - create one and create session
	if (!userByAddresses) {
		const newUser = await createUser(reqBody.addresses);
		await createSession(newUser.id, response);
	}

	return {};
}
