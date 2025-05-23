import { relations } from 'drizzle-orm';
import { integer, json, pgEnum, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export type DivviRegistration =
  | {
      status: 'unchecked' | 'was_already_registered';
      hash?: never;
      receipt?: never;
    }
  | { status: 'transaction_submitted'; hash: string; receipt?: never }
  | { status: 'registered'; hash?: never; receipt: any };

export type User = typeof Users.$inferSelect;
export const Users = pgTable('Users', {
  id: serial().primaryKey(),
  divviRegistration: json().$type<DivviRegistration>().default({ status: 'unchecked' }).notNull(),
  coins: integer().default(0).notNull(),
});

export const UsersRelations = relations(Users, ({ many }) => ({
  addresses: many(UserAddresses),
}));

export const UserAddresses = pgTable('UserWallets', {
  id: serial().primaryKey(),
  address: varchar({ length: 255 }).notNull(),
  userId: integer().notNull(),
});

export const UserAddressesRelations = relations(UserAddresses, ({ one }) => ({
  user: one(Users, {
    fields: [UserAddresses.userId],
    references: [Users.id],
  }),
}));

export const Sessions = pgTable('Sessions', {
  id: serial().primaryKey(),
  userId: integer()
    .references(() => Users.id)
    .unique()
    .notNull(),
  cookie: varchar({ length: 500 }).notNull(),
});

export const GameStatusEnum = pgEnum('GameStatus', [
  'in_progress',
  'paused',
  'won',
  'lost',
  'aborted',
]);

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
  gameState: json().$type<GameState>(),
  coinsAtStake: integer().notNull(),
});

export const QuestStatusEnum = pgEnum('QuestStatus', [
  'available',
  'picked_up',
  'reward_awaiting',
  'reward_claimed',
]);

export const Quests = pgTable('Quests', {
  id: serial().primaryKey(),
  userId: integer()
    .references(() => Users.id)
    .notNull(),
  questData: json().$type<any>().notNull(),
  status: QuestStatusEnum().notNull().default('available'),
  createdAt: timestamp().defaultNow().notNull(),
  pickedUpAt: timestamp(),
  finishedAt: timestamp(),
  rewardClaimedAt: timestamp(),
});
