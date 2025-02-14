import { int, json, singlestoreTable } from "drizzle-orm/singlestore-core";

export type UserType = typeof Users.$inferSelect
export const Users = singlestoreTable("Users", {
  id: int("id").primaryKey().autoincrement(),
  addresses: json().$type<string[]>()
});
