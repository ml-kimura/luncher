import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { createLogger, type Logger } from "@packages/logger";
import { SlackClient } from "../clients/slack.js";
import { resolveLunchDate } from "../date.js";
import { formatTemplate, loadMessageCatalog } from "../messages/catalog.js";
import { LunchDatesRepository } from "../repositories/lunchDatesRepo.js";
import type { PostDailyLunchAnnouncementInput, PostDailyLunchAnnouncementResult } from "../types.js";

interface Dependencies {
  pool: Pool;
  slackClient: SlackClient;
  logger: Logger;
  channelId: string;
  announcementMessageCode: string;
  getMessageTemplate: (code: string, locale: "ja" | "en") => string;
}

const createDependenciesFromEnv = (): Dependencies => {
  const databaseUrl = process.env.DATABASE_URL;
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const slackChannelId = process.env.SLACK_ANNOUNCEMENT_CHANNEL_ID;
  const announcementMessageCode = process.env.BATCH_ANNOUNCEMENT_MESSAGE_CODE ?? "T-BAT-101";

  if (!databaseUrl) throw new Error("DATABASE_URL is required.");
  if (!slackBotToken) throw new Error("SLACK_BOT_TOKEN is required.");
  if (!slackChannelId) throw new Error("SLACK_ANNOUNCEMENT_CHANNEL_ID is required.");
  const catalog = loadMessageCatalog();

  return {
    pool: new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("sslmode=disable") ? false : true,
    }),
    slackClient: new SlackClient(slackBotToken),
    logger: createLogger({ service: "batch" }).child({ job: "daily-lunch-announcement" }),
    channelId: slackChannelId,
    announcementMessageCode,
    getMessageTemplate: catalog.getTemplateByCode,
  };
};

export const postDailyLunchAnnouncement = async (
  input: PostDailyLunchAnnouncementInput = {},
  deps: Dependencies = createDependenciesFromEnv(),
): Promise<PostDailyLunchAnnouncementResult> => {
  const lunchDate = resolveLunchDate(input.lunchDate);
  const runId = randomUUID();
  const repo = new LunchDatesRepository(deps.pool);

  try {
    return await repo.withTransaction(async (client) => {
      const existing = await repo.upsertAndLockLunchDate(client, lunchDate);
      if (existing.slackMessageTs) {
        deps.logger.warn("W-BAT-101 skipped duplicate announcement", {
          code: "W-BAT-101",
          runId,
          lunchDate,
          slackMessageTs: existing.slackMessageTs,
        });
        return {
          status: "ok",
          lunchDate,
          skipped: true,
          slackMessageTs: existing.slackMessageTs,
        };
      }

      const template = deps.getMessageTemplate(deps.announcementMessageCode, "ja");
      const message = formatTemplate(template, { lunchDate });

      const posted = await deps.slackClient.postMessage({
        channel: deps.channelId,
        text: message,
      });

      await repo.updateSlackMessage(client, lunchDate, posted.ts, posted.channel);

      deps.logger.info("I-BAT-101 posted daily lunch announcement", {
        code: "I-BAT-101",
        runId,
        lunchDate,
        slackMessageTs: posted.ts,
        slackChannelId: posted.channel,
      });

      return {
        status: "ok",
        lunchDate,
        skipped: false,
        slackMessageTs: posted.ts,
      };
    });
  } catch (error) {
    deps.logger.error("E-BAT-101 failed to post daily lunch announcement", {
      code: "E-BAT-101",
      runId,
      lunchDate,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    throw error;
  } finally {
    await deps.pool.end();
  }
};
