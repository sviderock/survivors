import { createMiddleware } from '@solidjs/start/middleware';
import { type FetchEvent } from '@solidjs/start/server';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { type StoredSessionData } from '~/lib/api/sessions';

async function session(event: FetchEvent) {
	try {
		event.nativeEvent.context.йцу = 123;
		const cookies = cookie.parse(event.request.headers.get('cookie') || '');
		const decoded = jwt.verify(cookies.auth!, process.env.SESSION_SECRET);
		event.locals.session = decoded as StoredSessionData;
	} catch (error) {
		event.locals.session = null;
	}
}

export default createMiddleware({
	onRequest: [session],
});
