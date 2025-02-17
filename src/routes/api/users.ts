'use server';
import { UserAddresses, Users, type UserType } from '@/schema';
import { type APIEvent } from '@solidjs/start/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '~/db';
import { createSession, getSession } from '~/routes/api/sessions';

async function getUserById<T extends string | undefined = undefined>(id: number, throwMsg?: T) {
	const user = (await db.select().from(Users).where(eq(Users.id, id)))[0];
	if (!user && throwMsg) throw new Error(throwMsg);
	return user as UserType | (T extends string ? never : undefined);
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
		const [user] = await tx.insert(Users).values({}).returning({ userId: Users.id });
		await tx
			.insert(UserAddresses)
			.values(addresses.map((address) => ({ userId: user!.userId, address })));
		return user!.userId;
	});

	if (!newUserId) throw new Error('User cannot be created');
	return newUserId;
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
		return {};
	}

	// if there are no user - create one and create session
	if (!userByAddresses) {
		const newUserId = await createUser(reqBody.addresses);
		await createSession(newUserId, response);
	}

	return {};
}
