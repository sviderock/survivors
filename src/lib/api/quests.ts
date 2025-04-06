'use server';
import { Quests, UserAddresses } from '@/schema';
import { eq } from 'drizzle-orm';
import { getRequestEvent } from 'solid-js/web';
import { db } from '~/db';

function groupBy<T extends object, K extends string>(arr: T[], cb: (item: T) => K): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = cb(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}

const QUEST_NUMBER = 3;

export async function checkQuestsForUser() {
  const userId = getRequestEvent()?.locals.session?.userId;
  if (!userId) {
    throw new Error('somehow request to start a game was sent without an active user');
  }

  const activeQuests = await db
    .select()
    .from(Quests)
    .where(eq(Quests.userId, userId))
    .leftJoin(UserAddresses, eq(UserAddresses.userId, userId));
  const grouped = groupBy(activeQuests, (q) => q.Quests.status);

  // there should always be 3 quests
  if (activeQuests.length < QUEST_NUMBER) {
    const newQuests = new Array({ length: QUEST_NUMBER - activeQuests.length }).map(
      (): typeof Quests.$inferInsert => ({
        userId,
        questData: {
          // TODO
        },
      }),
    );
    await db.insert(Quests).values(newQuests);
  }

  // if there are active quests then check if the conditions are met
  if (grouped.picked_up?.length) {
    const _oldestPickedUpQuest = [...grouped.picked_up].sort(
      (a, b) => a.Quests.pickedUpAt!.valueOf() - b.Quests.pickedUpAt!.valueOf(),
    );

    const _address = grouped.picked_up[0]!.UserWallets!.address;
  }
}
