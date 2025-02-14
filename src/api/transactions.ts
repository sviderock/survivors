'use server';
import { query } from '@solidjs/router';

export const getTransactions = query(async (address: string) => {
	const data = await fetch(`${import.meta.env.VITE_ZERION_API}/wallets/${address}/transactions`, {
		headers: {
			accept: 'application/json',
			authorization: `Basic ${import.meta.env.VITE_ZERION_API_KEY}`,
		},
	});
	const json = await data.json();
	return json;
}, 'transactions');
