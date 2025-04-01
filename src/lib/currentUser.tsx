import { Sessions, UserAddresses, Users } from "@/schema";
import { action, query, useAction } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { and, eq, inArray } from "drizzle-orm";
import { createSignal, onMount } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { db } from "~/db";
import { createSession, logoutSession } from "~/lib/api/sessions";

const getUserBySession = query(async () => {
  "use server";
  const session = getRequestEvent()?.locals.session;
  if (!session) return null;

  const user = await db.query.Users.findFirst({
    where: eq(Users.id, session.userId),
    with: { addresses: true },
  });

  return user ?? null;
}, "current-user");

const getUserByAddressesOrCreate = action(async (addresses: string[]) => {
  "use server";
  if (!getRequestEvent()) return null;

  const userByAddresses = await db.query.Users.findFirst({
    where: (users, { exists }) =>
      exists(
        db
          .select()
          .from(UserAddresses)
          .where(and(eq(UserAddresses.userId, users.id), inArray(UserAddresses.address, addresses)))
      ),
    with: { addresses: true },
  });

  if (userByAddresses) {
    await db.delete(Sessions).where(eq(Sessions.userId, userByAddresses.id));
    await createSession(userByAddresses.id);
    return userByAddresses;
  }

  const newUser = await db.transaction(async (tx) => {
    const [user] = await tx.insert(Users).values({}).returning();
    const userAddresses = await tx
      .insert(UserAddresses)
      .values(addresses.map((address) => ({ userId: user!.id, address })))
      .returning();
    return { ...user!, addresses: userAddresses };
  });
  await createSession(newUser.id);
  return newUser;
}, "get-user-by-addresses-or-create1");

const logoutUser = action(async () => {
  "use server";
  await logoutSession();
});

export function currentUser() {
  const user = createQuery(() => ({
    queryKey: ["current-user"],
    queryFn: () => getUserBySession(),
    refetchInterval: (q) => (q.state.data ? 10_000 : false),
  }));

  const logout = useAction(logoutUser);

  return { user, logout };
}
