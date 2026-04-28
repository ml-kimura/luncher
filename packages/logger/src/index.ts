import pino, { type Logger as PinoLogger } from "pino";

export interface Logger {
  debug: (message: string, fields?: Record<string, unknown>) => void;
  info: (message: string, fields?: Record<string, unknown>) => void;
  warn: (message: string, fields?: Record<string, unknown>) => void;
  error: (message: string, fields?: Record<string, unknown>) => void;
  child: (bindings: Record<string, unknown>) => Logger;
}

export interface CreateLoggerOptions {
  service: string;
  level?: pino.LevelWithSilent;
  baseFields?: Record<string, unknown>;
}

const wrap = (logger: PinoLogger): Logger => ({
  debug: (message, fields) => logger.debug(fields ?? {}, message),
  info: (message, fields) => logger.info(fields ?? {}, message),
  warn: (message, fields) => logger.warn(fields ?? {}, message),
  error: (message, fields) => logger.error(fields ?? {}, message),
  child: (bindings) => wrap(logger.child(bindings)),
});

export const createLogger = (options: CreateLoggerOptions): Logger => {
  const baseLogger = pino({
    level: options.level ?? (process.env.LOG_LEVEL as pino.LevelWithSilent | undefined) ?? "info",
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      service: options.service,
      ...(options.baseFields ?? {}),
    },
  });
  return wrap(baseLogger);
};
