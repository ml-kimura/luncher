import type { Pool, PoolClient } from "pg";

interface LunchDateRow {
  lunchDate: string;
  slackMessageTs: string | null;
}

const rowMapper = (row: { lunch_date: string; slack_message_ts: string | null }): LunchDateRow => ({
  lunchDate: row.lunch_date,
  slackMessageTs: row.slack_message_ts,
});

export class LunchDatesRepository {
  constructor(private readonly pool: Pool) {}

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async upsertAndLockLunchDate(client: PoolClient, lunchDate: string): Promise<LunchDateRow> {
    await client.query(
      `
      INSERT INTO lunch_dates (lunch_date, created_at, updated_at)
      VALUES ($1::date, NOW(), NOW())
      ON CONFLICT (lunch_date) DO NOTHING
      `,
      [lunchDate],
    );

    const result = await client.query<{ lunch_date: string; slack_message_ts: string | null }>(
      `
      SELECT lunch_date, slack_message_ts
      FROM lunch_dates
      WHERE lunch_date = $1::date
      FOR UPDATE
      `,
      [lunchDate],
    );

    if (!result.rows[0]) {
      throw new Error("Failed to load lunch_dates row after upsert.");
    }

    return rowMapper(result.rows[0]);
  }

  async updateSlackMessage(client: PoolClient, lunchDate: string, slackMessageTs: string, slackChannelId: string): Promise<void> {
    await client.query(
      `
      UPDATE lunch_dates
      SET slack_message_ts = $2, slack_channel_id = $3, updated_at = NOW()
      WHERE lunch_date = $1::date
      `,
      [lunchDate, slackMessageTs, slackChannelId],
    );
  }
}
