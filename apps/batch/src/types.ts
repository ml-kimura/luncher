export interface PostDailyLunchAnnouncementInput {
  lunchDate?: string;
}

export interface PostDailyLunchAnnouncementResult {
  status: "ok";
  lunchDate: string;
  skipped: boolean;
  slackMessageTs: string | null;
}

export interface SlackPostMessageInput {
  channel: string;
  text: string;
}

export interface SlackPostMessageResult {
  ts: string;
  channel: string;
}
