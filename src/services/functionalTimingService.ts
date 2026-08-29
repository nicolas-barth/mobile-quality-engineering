import { FunctionalTiming } from '../types/performance';

export async function measureOperation(
  operation: string,
  action: () => Promise<void>,
): Promise<FunctionalTiming> {
  const startedAt = process.hrtime.bigint();
  await action();
  const finishedAt = process.hrtime.bigint();

  return {
    operation,
    durationMs: Number(finishedAt - startedAt) / 1_000_000,
  };
}
