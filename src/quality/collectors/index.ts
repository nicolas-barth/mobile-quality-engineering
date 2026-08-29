import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { listCompatibilityProfileNames } from '../../../config/devices/compatibilityProfiles';
import { Finding } from '../../types/finding';
import { MonkeyRunResult, StabilityMetrics } from '../../types/stability';
import { DataMode, QualityExecution } from '../types/execution';
import { QualityResult } from '../types/result';

import { collectGitMetadata } from './gitMetadata';
import { collectJunitResults } from './junitCollector';
import { collectManualEvidenceResults } from './manualEvidenceCollector';
import { collectPerformanceResults } from './performanceCollector';
import { collectSecurityResults } from './securityCollector';
import { collectStabilityResults } from './stabilityCollector';
import { buildSpecIndex, loadTraceabilityMatrix, TraceabilityEntry } from './traceability';

export interface RawEvidence {
  findings: Finding[];
  stabilitySummary?: StabilityMetrics;
  monkeyResult?: MonkeyRunResult;
  performanceMaxRegressionRatio?: number;
  traceabilityEntries: TraceabilityEntry[];
}

export interface CollectedEvidence {
  execution: QualityExecution;
  raw: RawEvidence;
}

export interface CollectOptions {
  root?: string;
  appVersion?: string;
  env?: NodeJS.ProcessEnv;
}

function readAppVersion(root: string): string | undefined {
  const versionPath = path.join(root, 'app', 'android', 'VERSION.txt');
  if (!fs.existsSync(versionPath)) {
    return undefined;
  }
  const match = /^version=(.+)$/m.exec(fs.readFileSync(versionPath, 'utf-8'));
  return match?.[1]?.trim();
}

function generateExecutionId(timestamp: string, commitSha: string | undefined): string {
  const compactTimestamp = timestamp.replace(/[-:.]/g, '').replace('T', '-').replace('Z', '');
  const shortCommit = commitSha !== undefined ? commitSha.slice(0, 7) : 'local';
  return `${compactTimestamp}-${shortCommit}-${randomUUID().slice(0, 8)}`;
}

function resolveEnvironment(env: NodeJS.ProcessEnv): string {
  return env.CI === 'true' ? 'ci' : 'local';
}

function resolveTrigger(env: NodeJS.ProcessEnv): string {
  return env.GITHUB_EVENT_NAME ?? (env.CI === 'true' ? 'ci' : 'manual');
}

function collectJunitAcrossProfiles(
  root: string,
  executionId: string,
  timestamp: string,
  traceabilityBySpec: Map<string, TraceabilityEntry>,
): QualityResult[] {
  const testResultsRoot = path.join(root, 'test-results');
  const knownProfiles = listCompatibilityProfileNames();
  const profileDirectories = knownProfiles.filter((profile) =>
    fs.existsSync(path.join(testResultsRoot, profile)),
  );

  if (profileDirectories.length === 0) {
    return collectJunitResults(root, { executionId, timestamp, traceabilityBySpec }).results;
  }

  const results: QualityResult[] = [];
  for (const profile of profileDirectories) {
    const { results: profileResults } = collectJunitResults(root, {
      testResultsDir: path.join('test-results', profile),
      executionId,
      timestamp,
      traceabilityBySpec,
      compatibilityProfile: profile,
    });
    results.push(...profileResults);
  }
  return results;
}

export function collectQualityEvidence(options: CollectOptions = {}): CollectedEvidence {
  const root = options.root ?? process.cwd();
  const env = options.env ?? process.env;
  const startedAt = new Date().toISOString();

  const git = collectGitMetadata(env);
  const executionId = generateExecutionId(startedAt, git.commitSha);

  const traceabilityEntries = loadTraceabilityMatrix(root);
  const traceabilityBySpec = buildSpecIndex(traceabilityEntries);

  const junitResults = collectJunitAcrossProfiles(root, executionId, startedAt, traceabilityBySpec);
  const security = collectSecurityResults(root, { executionId, timestamp: startedAt });
  const stability = collectStabilityResults(root, { executionId, timestamp: startedAt });
  const performance = collectPerformanceResults(root, { executionId, timestamp: startedAt });
  const manual = collectManualEvidenceResults(root, { executionId, timestamp: startedAt });

  const results: QualityResult[] = [
    ...junitResults,
    ...security.results,
    ...stability.results,
    ...performance.results,
    ...manual,
  ];

  const completedAt = new Date().toISOString();
  const dataMode: DataMode = 'REAL';

  const execution: QualityExecution = {
    executionId,
    startedAt,
    completedAt,
    branch: git.branch,
    commitSha: git.commitSha,
    pullRequest: git.pullRequest,
    appVersion: options.appVersion ?? readAppVersion(root),
    platform: 'android',
    environment: resolveEnvironment(env),
    trigger: resolveTrigger(env),
    dataMode,
    results,
  };

  return {
    execution,
    raw: {
      findings: security.findings,
      stabilitySummary: stability.summary,
      monkeyResult: stability.monkey,
      performanceMaxRegressionRatio: performance.maxRegressionRatio,
      traceabilityEntries,
    },
  };
}
