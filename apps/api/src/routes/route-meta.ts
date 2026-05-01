export type ApiKind = 'command' | 'resource';

export const withApiKind = <TRoute extends Record<string, unknown>>(
  route: TRoute,
  kind: ApiKind
): TRoute & { 'x-api-kind': ApiKind } => ({
  ...route,
  'x-api-kind': kind,
});
