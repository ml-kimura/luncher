import { pgTable, date, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const lunchDates = pgTable('lunch_dates', {
  lunchDate: date('lunch_date').primaryKey().notNull(),
  slackMessageTs: text('slack_message_ts'),
  slackChannelId: text('slack_channel_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull(),
});
