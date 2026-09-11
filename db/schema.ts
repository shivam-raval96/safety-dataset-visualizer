import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const comments = sqliteTable('comments', {
  sequence: integer('sequence').primaryKey({ autoIncrement: true }),
  id: text('id').notNull(),
  targetKey: text('target_key').notNull(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  name: text('name').notNull(),
  comment: text('comment').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [uniqueIndex('comments_id_unique').on(table.id), index('comments_target_sequence').on(table.targetKey, table.sequence)]);

export const commentLimits = sqliteTable('comment_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  expiresAt: integer('expires_at').notNull(),
});
