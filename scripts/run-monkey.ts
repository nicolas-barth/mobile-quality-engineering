import fs from 'node:fs';
import path from 'node:path';

import { loadEnv } from '../src/config/env';
import { collectLogcat } from '../src/services/adbService';
import { runMonkey } from '../src/services/monkeyService';

const RESULTS_PATH = path.join('reports', 'stability', 'monkey.json');

function readIntEnv(name: string): number | undefined {
  const raw = process.env[name];
  return raw ? Number.parseInt(raw, 10) : undefined;
}

async function main(): Promise<void> {
  const env = loadEnv();

  const result = await runMonkey({
    packageName: env.androidAppPackage,
    eventCount: readIntEnv('MONKEY_EVENT_COUNT'),
    seed: readIntEnv('MONKEY_SEED'),
    throttleMs: readIntEnv('MONKEY_THROTTLE_MS'),
  });
  const logcat = await collectLogcat(500);

  fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
  fs.writeFileSync(RESULTS_PATH, JSON.stringify({ ...result, logcat }, null, 2));

  console.log(
    `Monkey run complete. seed=${result.seed} events=${result.eventCount} exitCode=${result.exitCode}`,
  );
  console.log(`crashDetected=${result.crashDetected} anrDetected=${result.anrDetected}`);

  if (result.crashDetected || result.anrDetected) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
