import { pgTable, text, serial } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  team: text('team').notNull(),
  userNo: text('user_no').notNull(),
  url: text('url').notNull(),
});

export const mappool = pgTable('mappool', {
  id: serial('id').primaryKey(),
  mapNo: text('map_no').notNull(),
  url: text('url').notNull(),
});

export const teamLabels = pgTable('team_labels', {
  team: text('team').primaryKey(),
  displayName: text('display_name').notNull(),
});
