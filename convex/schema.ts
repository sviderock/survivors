import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("paused"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("aborted")
    ),
    players: v.record(
      v.string(),
      v.object({
        name: v.string(),
        pos: v.object({ x: v.number(), y: v.number() }),
      })
    ),
  }),
});
