import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

import { MonkeyRunOptions, MonkeyRunResult } from '../types/stability';

import { assertValidPackageName } from './adbService';

const execFile = promisify(execFileCallback);

const DEFAULT_SEED = 1234;
const DEFAULT_EVENT_COUNT = 500;
const DEFAULT_THROTTLE_MS = 200;

const CRASH_PATTERN = /CRASH|FATAL EXCEPTION/i;
const ANR_PATTERN = /ANR|Not Responding/i;

interface ExecFileError extends Error {
  code?: number;
  stdout?: string;
}

export function buildMonkeyArgs(options: MonkeyRunOptions): string[] {
  return [
    'shell',
    'monkey',
    '-p',
    options.packageName,
    '-s',
    options.seed.toString(),
    '--throttle',
    options.throttleMs.toString(),
    '-v',
    options.eventCount.toString(),
  ];
}

export function parseMonkeyOutput(output: string): {
  crashDetected: boolean;
  anrDetected: boolean;
} {
  return {
    crashDetected: CRASH_PATTERN.test(output),
    anrDetected: ANR_PATTERN.test(output),
  };
}

export async function runMonkey(
  options: Partial<Omit<MonkeyRunOptions, 'packageName'>> & { packageName: string },
): Promise<MonkeyRunResult> {
  assertValidPackageName(options.packageName);

  const resolved: MonkeyRunOptions = {
    packageName: options.packageName,
    eventCount: options.eventCount ?? DEFAULT_EVENT_COUNT,
    seed: options.seed ?? DEFAULT_SEED,
    throttleMs: options.throttleMs ?? DEFAULT_THROTTLE_MS,
  };

  try {
    const { stdout } = await execFile('adb', buildMonkeyArgs(resolved), {
      maxBuffer: 1024 * 1024 * 10,
    });
    return {
      packageName: resolved.packageName,
      seed: resolved.seed,
      eventCount: resolved.eventCount,
      exitCode: 0,
      output: stdout,
      ...parseMonkeyOutput(stdout),
    };
  } catch (error) {
    const execError = error as ExecFileError;
    const output = execError.stdout ?? '';
    return {
      packageName: resolved.packageName,
      seed: resolved.seed,
      eventCount: resolved.eventCount,
      exitCode: execError.code ?? 1,
      output,
      ...parseMonkeyOutput(output),
    };
  }
}
