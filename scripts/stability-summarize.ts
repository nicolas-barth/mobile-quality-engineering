import fs from 'node:fs';
import path from 'node:path';

import { summarizeStabilityRun } from '../src/services/stabilityMetricsService';
import { StabilityExecutionResult } from '../src/types/stability';

function readLogLines(logDir: string | undefined): string[] {
  if (!logDir || !fs.existsSync(logDir)) {
    return [];
  }

  const lines: string[] = [];
  for (const entry of fs.readdirSync(logDir)) {
    lines.push(...fs.readFileSync(path.join(logDir, entry), 'utf-8').split('\n'));
  }
  return lines;
}

function main(): void {
  const runsFilePath = process.argv[2];
  const logDir = process.argv[3];

  if (!runsFilePath) {
    throw new Error('Usage: tsx scripts/stability-summarize.ts <runs.jsonl> [logDir]');
  }

  const runs: StabilityExecutionResult[] = fs
    .readFileSync(runsFilePath, 'utf-8')
    .trim()
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as StabilityExecutionResult);

  const metrics = summarizeStabilityRun(runs, readLogLines(logDir));
  const summaryPath = path.join(path.dirname(runsFilePath), 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(metrics, null, 2));

  console.log(`Stability summary written to ${summaryPath}`);
  console.log(JSON.stringify(metrics, null, 2));
}

main();
