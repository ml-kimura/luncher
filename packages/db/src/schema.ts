import { pgTable, date, text, timestamp, primaryKey, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const lunchDates = pgTable('lunch_dates', {
  lunchDate: date('lunch_date').primaryKey().notNull(),
  slackMessageTs: text('slack_message_ts'),
  slackChannelId: text('slack_channel_id'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const systemConfigs = pgTable(
  'system_configs',
  {
    configKey: text('config_key').notNull(),
    effectiveFrom: date('effective_from').notNull(),
    configValue: jsonb('config_value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.effectiveFrom, table.configKey], name: 'system_configs_pkey' })]
);
