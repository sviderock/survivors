'use server';
import { Sessions, type UserType } from '@/schema';
import jwt from 'jsonwebtoken';
import { db } from '~/db';
import cookie from 'cookie';
import type { ResponseStub } from '@solidjs/start/server';
import { isDev } from 'solid-js/web';

type StoredSessionData = { userId: UserType['id'] };

export async function getSession<T extends Request>(request: T) {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	if (!cookies.auth) return null;

	try {
		const decoded = jwt.verify(cookies.auth!, process.env.SESSION_SECRET);
		return decoded as StoredSessionData;
	} catch (error) {
		console.warn('An error occured verifying the session', error);
		return null;
	}
}

export async function createSession(userId: UserType['id'], response: ResponseStub) {
	const token = jwt.sign({ userId } satisfies StoredSessionData, process.env.SESSION_SECRET);
	const [savedSession] = await db.insert(Sessions).values({ userId, cookie: token }).returning();

	if (!savedSession?.cookie) throw new Error("Couldn't create session for user");

	response.headers.set(
		'Set-Cookie',
		cookie.serialize('auth', savedSession.cookie, {
			path: '/',
			secure: !isDev,
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 7, // 1 week
		}),
	);
}
