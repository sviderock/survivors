// 'use server';
// import { type PlayedGame, Sessions, type User } from '@/schema';
// import cookie from 'cookie';
// import { and, eq } from 'drizzle-orm';
// import jwt from 'jsonwebtoken';
// import { getRequestEvent, isDev } from 'solid-js/web';
// import { db } from '~/db';

// export type StoredSessionData = { userId: User['id']; gameId?: PlayedGame['id'] };

// function getCookieOptions(): cookie.SerializeOptions {
//   return {
//     path: '/',
//     secure: !isDev,
//     httpOnly: true,
//     maxAge: 60 * 60 * 24 * 7, // 1 week
//   };
// }

// export async function createSession(userId: User['id']) {
//   const token = jwt.sign({ userId } satisfies StoredSessionData, process.env.SESSION_SECRET);
//   const [savedSession] = await db.insert(Sessions).values({ userId, cookie: token }).returning();

//   if (!savedSession?.cookie) throw new Error("Couldn't create session for user");
//   if (!getRequestEvent()) throw new Error('Event is missing?');

//   getRequestEvent()!.response.headers.set(
//     'Set-Cookie',
//     cookie.serialize('auth', savedSession.cookie, getCookieOptions()),
//   );
// }

// export async function logoutSession() {
//   const session = getRequestEvent()?.locals.session;
//   if (session) {
//     await db.delete(Sessions).where(and(eq(Sessions.userId, session.userId)));
//   }

//   getRequestEvent()!.response.headers.set(
//     'Set-Cookie',
//     cookie.serialize('auth', '', {
//       ...getCookieOptions(),
//       maxAge: undefined,
//       expires: new Date(0),
//     }),
//   );
// }
