import { Quests, UserAddresses, Users, type UserType } from '@/schema';
import { and, eq } from 'drizzle-orm';
import { db } from '~/db';
import { getTransactions } from '~/routes/api/transactions';

export async function checkQuestsForUser(userId: UserType['id']) {
	const activeQuests = await db
		.select()
		.from(Quests)
		.where(and(eq(Users.id, userId), eq(Quests.status, 'picked_up')))
		.leftJoin(Users, eq(Users.id, Quests.userId))
		.leftJoin(UserAddresses, eq(Users.id, UserAddresses.userId));

	console.log(activeQuests);
	if (!activeQuests.length) return;

	activeQuests.forEach(async (data) => {
		if (data.Quests.type.type === 'coins_multiplier') {
			const transactions = await getTransactions({
				address: data.UserWallets!.address,
				since: data.Quests.pickedUpAt,
			});
			console.log(transactions);
		}
	});
}
