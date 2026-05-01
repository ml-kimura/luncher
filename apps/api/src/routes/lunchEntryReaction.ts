import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { MediaType } from '../http/media-type.js';
import { ApiResponseStatus, errorResponseSchema } from '../messages/responses.js';
import { commandResultSchema } from './response-policy.js';
import { withApiKind } from './route-meta.js';
import { ApiRouteTag } from './tags.js';

const lunchEntryReactionRequestSchema = z.object({
  eventId: z.string().min(1),
  eventType: z.enum(['reaction_added', 'reaction_removed']),
  reaction: z.string().min(1),
  lunchDate: z.iso.date(),
  slackUserId: z.string().min(1),
  channelId: z.string().min(1),
  messageTs: z.string().min(1),
  occurredAt: z.iso.datetime(),
});

const lunchEntryReactionResponseSchema = commandResultSchema(z.enum(['accepted', 'no_change', 'rejected']), {
  lunchDate: z.iso.date(),
  slackUserId: z.string(),
  attendanceStatus: z.enum(['joined', 'left', 'unchanged']),
});

const errorContent = {
  [MediaType.ApplicationJson]: {
    schema: errorResponseSchema(),
  },
} as const;

const lunchEntryReactionRoute = createRoute(
  withApiKind(
    {
      method: 'post',
      path: '/lunch-entry-reaction',
      operationId: 'postLunchEntryReaction',
      tags: [ApiRouteTag.Slack],
      summary: '参加表明受付',
      description: 'Slack リアクションイベントを受け取り、当日ランチ参加状態を更新する内部 API（US-002）。',
      request: {
        body: {
          content: {
            [MediaType.ApplicationJson]: {
              schema: lunchEntryReactionRequestSchema,
            },
          },
          required: true,
        },
      },
      responses: {
        200: {
          description: 'イベント処理結果（更新あり/なし、または受理拒否）',
          content: {
            [MediaType.ApplicationJson]: {
              schema: lunchEntryReactionResponseSchema,
            },
          },
        },
        400: {
          description: '必須項目欠落、eventType 不正（E-API-001）',
          content: errorContent,
        },
        401: {
          description: '署名検証失敗（E-API-002）',
          content: errorContent,
        },
        403: {
          description: '内部認可失敗（E-API-003）',
          content: errorContent,
        },
        409: {
          description: '同一 eventId の競合（E-API-004）',
          content: errorContent,
        },
        500: {
          description: '内部エラー（F-API-001）',
          content: errorContent,
        },
      },
    },
    'command'
  )
);

export const lunchEntryReactionRoutes = new OpenAPIHono();

lunchEntryReactionRoutes.openapi(lunchEntryReactionRoute, (c) => {
  const payload = c.req.valid('json');

  // NOTE: 署名検証・締切/上限判定・重複抑止は今後の実装対象。
  const attendanceStatus: 'joined' | 'left' = payload.eventType === 'reaction_added' ? 'joined' : 'left';

  return c.json(
    {
      status: ApiResponseStatus.Ok,
      result: 'accepted' as const,
      lunchDate: payload.lunchDate,
      slackUserId: payload.slackUserId,
      attendanceStatus,
    },
    200
  );
});
