import type { Id } from "@/convex/_generated/dataModel";
import { v } from "convex/values";
import { type QueryCtx, mutation, query } from "./_generated/server";

async function getGameOrThrow(args: { id: Id<"games">; ctx: QueryCtx }) {
  const game = await args.ctx.db.get(args.id);
  if (!game) throw new Error("No game?");
  return game;
}

export const createGame = mutation({
  args: {
    players: v.record(
      v.string(),
      v.object({
        name: v.string(),
        pos: v.object({ x: v.number(), y: v.number() }),
      })
    ),
  },
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert("games", { players: args.players, status: "not_started" });
    return ctx.db.get(gameId);
  },
});

export const getGame = query({
  handler: async (ctx) => {
    return ctx.db.query("games").take(1);
  },
});

export const addPlayer = mutation({
  args: { gameId: v.id("games"), playerName: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("No game?");
    }

    await ctx.db.patch(game._id, {
      players: {
        ...game.players,
        [args.playerName]: {
          name: args.playerName,
          pos: { x: 0, y: 0 },
        },
      },
    });
  },
});

export const getPlayer = mutation({
  args: { gameId: v.id("games"), playerName: v.string() },
  handler: async (ctx, args) => {},
});
