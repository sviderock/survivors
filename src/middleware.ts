import { PlayedGames } from "@/schema";
import { createMiddleware } from "@solidjs/start/middleware";
import { type FetchEvent } from "@solidjs/start/server";
import cookie from "cookie";
import { and, eq, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "~/db";
import { type StoredSessionData } from "~/lib/api/sessions";

async function session(event: FetchEvent) {
  try {
    const cookies = cookie.parse(event.request.headers.get("cookie") || "");
    const decoded = jwt.verify(cookies.auth!, process.env.SESSION_SECRET);
    event.locals.session = decoded as StoredSessionData;
  } catch (_error) {
    event.locals.session = undefined;
  }
}

async function activeGame(event: FetchEvent) {
  const session = event.locals.session;
  if (session) {
    const [game] = await db
      .select()
      .from(PlayedGames)
      .where(
        and(
          eq(PlayedGames.userId, session.userId),
          inArray(PlayedGames.status, ["in_progress", "paused"])
        )
      );

    event.locals.activeGame = game;
  }
}

export default createMiddleware({
  onRequest: [session, activeGame],
});
