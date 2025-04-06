import { Users } from '@/schema';
import { action, query, useAction } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { eq } from 'drizzle-orm';
import { getRequestEvent } from 'solid-js/web';
import { db } from '~/db';
import { logoutSession } from '~/lib/api/sessions';

const getUserBySession = query(async () => {
  'use server';
  const session = getRequestEvent()?.locals.session;
  if (!session) return null;

  const user = await db.query.Users.findFirst({
    where: eq(Users.id, session.userId),
    with: { addresses: true },
  });

  return user ?? null;
}, 'current-user');

const logoutUser = action(async () => {
  'use server';
  await logoutSession();
});

export function currentUser() {
  const user = createQuery(() => ({
    queryKey: ['current-user'],
    queryFn: () => getUserBySession(),
    refetchInterval: (q) => (q.state.data ? 10_000 : false),
  }));

  const logout = useAction(logoutUser);

  return { user, logout };
}
