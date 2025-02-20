'use server';
import { type APIEvent } from '@solidjs/start/server';
import { logoutSession } from '~/routes/api/sessions';

export async function POST(event: APIEvent) {
	await logoutSession(event);
}
