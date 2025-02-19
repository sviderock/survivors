'use server';

async function fetchZerion(url: string) {
	const data = await fetch(`${import.meta.env.VITE_ZERION_API_URL}${url}`, {
		headers: {
			accept: 'application/json',
			authorization: `Basic ${import.meta.env.VITE_ZERION_API_KEY}`,
		},
	});
	const json = await data.json();
	return json as Zerion.Root;
}

const searchParams = new URLSearchParams();
export async function getTransactions({
	address,
	since,
}: {
	address: string;
	since?: Date | null;
}) {
	if (since) searchParams.append('filter[min_mined_at]', since.valueOf().toString());
	const data = await fetchZerion(`/wallets/${address}/transactions?${searchParams.toString()}`);

	console.log();
	data.data.forEach((tx) => {
		// console.log(tx.attributes.operation_type === '');
	});

	return data;
}
