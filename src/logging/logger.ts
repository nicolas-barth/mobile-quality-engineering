import pino from 'pino';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const wdioLogLevel = process.env.WDIO_LOG_LEVEL ?? 'info';

const transport =
  nodeEnv === 'ci'
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      };

export const logger = pino({
  level: wdioLogLevel,
  base: { module: 'mobile-quality-engineering' },
  transport,
});

export function createModuleLogger(moduleName: string): pino.Logger {
  return logger.child({ module: moduleName });
}
