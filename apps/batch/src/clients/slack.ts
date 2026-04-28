import type { SlackPostMessageInput, SlackPostMessageResult } from "../types.js";

interface SlackApiResponse {
  ok: boolean;
  error?: string;
  ts?: string;
  channel?: string;
}

const SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";

export class SlackClient {
  constructor(private readonly token: string) {}

  async postMessage(input: SlackPostMessageInput): Promise<SlackPostMessageResult> {
    const response = await fetch(SLACK_POST_MESSAGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        channel: input.channel,
        text: input.text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack API HTTP error: ${response.status}`);
    }

    const payload = (await response.json()) as SlackApiResponse;
    if (!payload.ok || !payload.ts || !payload.channel) {
      throw new Error(`Slack API returned failure: ${payload.error ?? "unknown_error"}`);
    }

    return {
      ts: payload.ts,
      channel: payload.channel,
    };
  }
}
