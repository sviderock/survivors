import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export type UserType = typeof Users.$inferSelect;
export const Users = pgTable('Users', {
	id: serial().primaryKey(),
	coins: integer().default(0),
});

export const UsersRelations = relations(Users, ({ many }) => ({
	addresses: many(UserAddresses),
}));

export const UserAddresses = pgTable('UserWallets', {
	id: serial().primaryKey(),
	address: varchar({ length: 255 }),
	userId: integer(),
});

export const UserAddressesRelations = relations(UserAddresses, ({ one }) => ({
	user: one(Users, {
		fields: [UserAddresses.userId],
		references: [Users.id],
	}),
}));

export const Sessions = pgTable('Sessions', {
	userId: integer()
		.references(() => Users.id)
		.unique(),
	cookie: varchar({ length: 500 }),
});

export const GameStatusEnum = pgEnum('GameStatus', ['in_progress', 'paused', 'won', 'lost']);

export type PlayedGame = typeof PlayedGames.$inferSelect;
export const PlayedGames = pgTable('PlayedGames', {
	id: serial().primaryKey(),
	userId: integer()
		.references(() => Users.id)
		.notNull(),
	startedAt: timestamp().defaultNow().notNull(),
	finishedAt: timestamp(),
	timeLimit: integer().notNull(),
	currentlyAt: integer().default(0).notNull(),
	status: GameStatusEnum().notNull(),
});
