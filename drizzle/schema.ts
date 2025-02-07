import { singlestoreTable, int } from "drizzle-orm/singlestore-core";

export const Test = singlestoreTable("test", {
  id: int("id").primaryKey().autoincrement()
});
