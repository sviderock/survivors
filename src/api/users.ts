'use server';
import { Users, type UserType } from '@/schema';
import { query } from '@solidjs/router';
import { arrayOverlaps, eq } from 'drizzle-orm';
import { useSession } from 'vinxi/http';
import { db } from '~/api/db';

function getSession() {
	return useSession({
		password: process.env.SESSION_SECRET,
	});
}

async function getUserById<T extends string | undefined = undefined>(id: number, throwMsg?: T) {
	const user = (await db.select().from(Users).where(eq(Users.id, id)))[0];
	if (!user && throwMsg) throw new Error(throwMsg);
	return user as UserType | (T extends string ? never : undefined);
}

async function getUserByAddresses<T extends string | undefined = undefined>(
	addresses: string[],
	throwMsg?: T,
) {
	const user = (await db.select().from(Users).where(arrayOverlaps(Users.addresses, addresses)))[0];
	if (!user && throwMsg) throw new Error(throwMsg);
	return user as UserType | (T extends string ? never : undefined);
}

async function createUser(addresses: string[]) {
	if (!addresses.length) throw new Error('Addresses are absent');
	const newUser = (await db.insert(Users).values({ addresses }).$returningId())[0];
	if (!newUser) throw new Error('User cannot be created');
	const user = await getUserById(newUser.id, 'Cannot find newly created user');
	return user;
}

export const getUser = query(async (addresses: string[]) => {
	const session = await getSession();
	const userId = session.data.userId;

	// if user is in session
	if (userId !== undefined) {
		const userById = await getUserById(userId);

		// if user found by id from the session
		if (userById) return userById;

		// otherwise search for the user by the addresses
		const userByAddresses = await getUserByAddresses(addresses);
		if (userByAddresses) return userByAddresses;

		// if no user found at all - create a user and return it
		const newUser = await createUser(addresses);
		await session.update((data) => (data.userId = newUser.id));
		return newUser;
	}

	// otherwise create user
	const newUser = await createUser(addresses);
	await session.update((data) => (data.userId = newUser.id));
	return newUser;
}, 'qwe');
