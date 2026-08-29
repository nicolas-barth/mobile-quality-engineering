import fs from 'node:fs';
import path from 'node:path';

import { createModuleLogger } from '../src/logging/logger';
import { CollectedEvidence, RawEvidence, collectQualityEvidence } from '../src/quality/collectors';
import { QUALITY_FIXTURE_NAMES, loadQualityFixture } from '../src/quality/fixtures';
import { evaluateQualityGates } from '../src/quality/gates/gateEngine';
import { buildQualityMetrics } from '../src/quality/metrics';
import { assessQualityEvidence } from '../src/quality/pipeline';
import { loadQualityPolicies } from '../src/quality/policies/loadPolicy';
import { buildQualityBadges } from '../src/quality/reporting/badge';
import { buildEvidenceManifest } from '../src/quality/reporting/evidenceManifest';
import { buildIntegrityManifest } from '../src/quality/reporting/integrity';
import {
  buildJobSummaryMarkdown,
  writeGithubJobSummary,
} from '../src/quality/reporting/jobSummary';
import { buildReleaseReportMarkdown } from '../src/quality/reporting/markdownReport';
import {
  buildQualitySnapshot,
  countSecurityFindingsBySeverity,
} from '../src/quality/reporting/snapshot';
import { calculateReleaseScore } from '../src/quality/scoring/scoreEngine';
import { loadLatestQualitySnapshot, saveQualitySnapshot } from '../src/quality/trend/history';
import { compareQualityTrend } from '../src/quality/trend/trendEngine';
import { ReleaseAssessment, ReleaseDecision } from '../src/quality/types/decision';
import { PolicyProfileName } from '../src/quality/types/policy';
import { QualityEngineError } from '../src/quality/validation/errors';
import { validateQualityExecution } from '../src/quality/validation/validateExecution';
import { Finding } from '../src/types/finding';

const logger = createModuleLogger('quality-cli');
const ROOT = process.cwd();
const RELEASE_DIR = path.join(ROOT, 'reports', 'release');
const DEMO_DIR = path.join(ROOT, 'reports', 'demo');
const PROFILE_NAMES: PolicyProfileName[] = ['PR', 'MAIN', 'NIGHTLY', 'RELEASE'];

function resolveProfile(): PolicyProfileName {
  const raw = process.env.QUALITY_POLICY_PROFILE ?? 'RELEASE';
  if (!PROFILE_NAMES.includes(raw as PolicyProfileName)) {
    throw new QualityEngineError(
      `Unknown QUALITY_POLICY_PROFILE "${raw}"; expected one of ${PROFILE_NAMES.join(', ')}`,
    );
  }
  return raw as PolicyProfileName;
}

function writeJson(dir: string, name: string, value: unknown): string {
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
  return filePath;
}

function readCollectedEvidence(dir: string): CollectedEvidence {
  const executionPath = path.join(dir, 'execution.json');
  const rawPath = path.join(dir, 'raw-evidence.json');
  if (!fs.existsSync(executionPath) || !fs.existsSync(rawPath)) {
    throw new QualityEngineError(
      `No collected evidence found in ${dir}; run "npm run quality:collect" first`,
    );
  }
  return {
    execution: validateQualityExecution(
      JSON.parse(fs.readFileSync(executionPath, 'utf-8')) as unknown,
    ),
    raw: JSON.parse(fs.readFileSync(rawPath, 'utf-8')) as RawEvidence,
  };
}

function readRawEvidence(dir: string): RawEvidence {
  const rawPath = path.join(dir, 'raw-evidence.json');
  if (!fs.existsSync(rawPath)) {
    return { findings: [], traceabilityEntries: [] };
  }
  return JSON.parse(fs.readFileSync(rawPath, 'utf-8')) as RawEvidence;
}

function cmdCollect(): void {
  const evidence = collectQualityEvidence({ root: ROOT });
  writeJson(RELEASE_DIR, 'execution.json', evidence.execution);
  writeJson(RELEASE_DIR, 'raw-evidence.json', evidence.raw);
  logger.info(
    {
      executionId: evidence.execution.executionId,
      results: evidence.execution.results.length,
      dataMode: evidence.execution.dataMode,
    },
    'Collected quality evidence',
  );
  console.log(
    `Collected ${evidence.execution.results.length} quality result(s) (dataMode=${evidence.execution.dataMode}) into ${RELEASE_DIR}`,
  );
}

function cmdNormalize(): void {
  const executionPath = path.join(RELEASE_DIR, 'execution.json');
  if (!fs.existsSync(executionPath)) {
    throw new QualityEngineError(
      'No collected evidence found; run "npm run quality:collect" first',
    );
  }
  const execution = validateQualityExecution(JSON.parse(fs.readFileSync(executionPath, 'utf-8')));
  writeJson(RELEASE_DIR, 'execution.json', execution);
  console.log(`Normalized and re-validated ${execution.results.length} quality result(s)`);
}

function cmdMetrics(): void {
  const { execution, raw } = readCollectedEvidence(RELEASE_DIR);
  const metrics = buildQualityMetrics({
    results: execution.results,
    traceabilityEntries: raw.traceabilityEntries ?? [],
    stabilitySummary: raw.stabilitySummary,
    monkeyResult: raw.monkeyResult,
  });
  writeJson(RELEASE_DIR, 'metrics.json', metrics);
  console.log(
    `Execution: ${metrics.execution.passed}/${metrics.execution.total} passed (${(metrics.execution.passRate * 100).toFixed(1)}%). Critical path: ${(metrics.criticalPath.passRate * 100).toFixed(1)}%.`,
  );
}

function cmdGates(): void {
  const { execution, raw } = readCollectedEvidence(RELEASE_DIR);
  const policies = loadQualityPolicies(ROOT);
  const profile = policies.profiles[resolveProfile()];
  const metrics = buildQualityMetrics({
    results: execution.results,
    traceabilityEntries: raw.traceabilityEntries ?? [],
    stabilitySummary: raw.stabilitySummary,
    monkeyResult: raw.monkeyResult,
  });
  const gates = evaluateQualityGates({
    metrics,
    results: execution.results,
    findings: raw.findings ?? [],
    performanceMaxRegressionRatio: raw.performanceMaxRegressionRatio,
    gates: policies.gates,
    profile,
  });
  writeJson(RELEASE_DIR, 'gates.json', gates);
  for (const gate of gates) {
    console.log(`[${gate.status}] ${gate.name}: expected ${gate.expected}, got ${gate.actual}`);
  }
}

function cmdScore(): void {
  const { execution, raw } = readCollectedEvidence(RELEASE_DIR);
  const policies = loadQualityPolicies(ROOT);
  const metrics = buildQualityMetrics({
    results: execution.results,
    traceabilityEntries: raw.traceabilityEntries ?? [],
    stabilitySummary: raw.stabilitySummary,
    monkeyResult: raw.monkeyResult,
  });
  const { score, dimensions } = calculateReleaseScore(metrics, policies.weights);
  writeJson(RELEASE_DIR, 'score.json', { score, dimensions });
  console.log(`Release Readiness Score: ${score}/100`);
  for (const dimension of dimensions) {
    console.log(
      `  ${dimension.category}: ${dimension.score}/${dimension.maxScore} (${dimension.evidenceStatus})`,
    );
  }
}

interface ReportArtifacts {
  assessment: ReleaseAssessment;
  findings: Finding[];
  outputDir: string;
}

function writeReportArtifacts({ assessment, findings, outputDir }: ReportArtifacts): void {
  const evidenceManifest = buildEvidenceManifest(ROOT, assessment.generatedAt);
  const previousSnapshot = loadLatestQualitySnapshot(ROOT);
  const trend = compareQualityTrend(
    previousSnapshot,
    buildQualitySnapshot(assessment, countSecurityFindingsBySeverity(findings)),
  );

  const assessmentPath = writeJson(outputDir, 'release-assessment.json', assessment);
  writeJson(outputDir, 'evidence-manifest.json', evidenceManifest);

  const reportPath = path.join(outputDir, 'release-report.md');
  fs.writeFileSync(reportPath, buildReleaseReportMarkdown(assessment, trend, evidenceManifest));

  const integrityManifest = buildIntegrityManifest([assessmentPath, reportPath]);
  writeJson(outputDir, 'integrity-manifest.json', integrityManifest);

  writeGithubJobSummary(assessment);

  console.log(buildJobSummaryMarkdown(assessment));
  console.log(`Release report written to ${reportPath}`);
}

function cmdReport(): void {
  const { execution, raw } = readCollectedEvidence(RELEASE_DIR);
  const { assessment } = assessQualityEvidence({ execution, raw }, resolveProfile(), ROOT);
  writeReportArtifacts({ assessment, findings: raw.findings, outputDir: RELEASE_DIR });
}

function exitCodeForAssessment(
  assessment: ReleaseAssessment,
  conditionalGoExitCode: 0 | 1,
): number {
  switch (assessment.decision) {
    case ReleaseDecision.Go:
      return 0;
    case ReleaseDecision.ConditionalGo:
      return conditionalGoExitCode;
    case ReleaseDecision.NoGo:
      return 1;
  }
}

function cmdRelease(): void {
  const profileName = resolveProfile();
  const evidence = collectQualityEvidence({ root: ROOT });
  writeJson(RELEASE_DIR, 'execution.json', evidence.execution);
  writeJson(RELEASE_DIR, 'raw-evidence.json', evidence.raw);

  const { assessment } = assessQualityEvidence(evidence, profileName, ROOT);
  const security = countSecurityFindingsBySeverity(evidence.raw.findings);
  const snapshot = buildQualitySnapshot(assessment, security);
  writeJson(RELEASE_DIR, 'quality-snapshot.json', snapshot);
  writeJson(RELEASE_DIR, 'badges.json', buildQualityBadges(assessment));

  writeReportArtifacts({ assessment, findings: evidence.raw.findings, outputDir: RELEASE_DIR });

  const policies = loadQualityPolicies(ROOT);
  const profile = policies.profiles[profileName];

  console.log('');
  console.log('Release Readiness');
  console.log('');
  console.log(`Decision: ${assessment.decisionLabel}`);
  console.log(`Score: ${assessment.score}/100`);
  console.log(`Confidence: ${assessment.confidence}`);
  console.log('');
  console.log(`Blocking Issues: ${assessment.blockers.length}`);
  console.log(`Warnings: ${assessment.warnings.length}`);

  process.exitCode = exitCodeForAssessment(assessment, profile.conditionalGoExitCode);
}

function cmdDemo(): void {
  console.log('SIMULATED QUALITY DATA');
  console.log('NOT A REAL PRODUCT EXECUTION');
  console.log('');

  const summaryLines = ['# Quality Governance Demo (SIMULATED)', ''];

  for (const fixtureName of QUALITY_FIXTURE_NAMES) {
    const evidence = loadQualityFixture(fixtureName, ROOT);
    const { assessment } = assessQualityEvidence(evidence, 'RELEASE', ROOT);
    const outputDir = path.join(DEMO_DIR, fixtureName);
    writeReportArtifacts({ assessment, findings: evidence.raw.findings, outputDir });

    summaryLines.push(
      `- **${fixtureName}**: ${assessment.decisionLabel}, score ${assessment.score}/100, confidence ${assessment.confidence}, ${assessment.blockers.length} blocker(s), ${assessment.warnings.length} warning(s)`,
    );
    console.log(`[${fixtureName}] ${assessment.decisionLabel} (score ${assessment.score}/100)`);
  }

  fs.mkdirSync(DEMO_DIR, { recursive: true });
  fs.writeFileSync(path.join(DEMO_DIR, 'summary.md'), summaryLines.join('\n') + '\n');
}

function cmdHistory(): void {
  const executionPath = path.join(RELEASE_DIR, 'release-assessment.json');
  if (!fs.existsSync(executionPath)) {
    throw new QualityEngineError(
      'No release-assessment.json found; run "npm run quality:release" first',
    );
  }
  const assessment = JSON.parse(fs.readFileSync(executionPath, 'utf-8')) as ReleaseAssessment;
  if (assessment.dataMode !== 'REAL') {
    throw new QualityEngineError('Refusing to save SIMULATED data into quality-history/');
  }
  const findings = readRawEvidence(RELEASE_DIR).findings;
  const snapshot = buildQualitySnapshot(assessment, countSecurityFindingsBySeverity(findings));
  const savedPath = saveQualitySnapshot(snapshot, ROOT);
  console.log(`Saved quality history snapshot to ${savedPath}`);
}

function cmdTrend(): void {
  const executionPath = path.join(RELEASE_DIR, 'release-assessment.json');
  if (!fs.existsSync(executionPath)) {
    throw new QualityEngineError(
      'No release-assessment.json found; run "npm run quality:release" first',
    );
  }
  const assessment = JSON.parse(fs.readFileSync(executionPath, 'utf-8')) as ReleaseAssessment;
  const findings = readRawEvidence(RELEASE_DIR).findings;
  const currentSnapshot = buildQualitySnapshot(
    assessment,
    countSecurityFindingsBySeverity(findings),
  );
  const previousSnapshot = loadLatestQualitySnapshot(ROOT);
  const trend = compareQualityTrend(previousSnapshot, currentSnapshot);
  writeJson(RELEASE_DIR, 'trend.json', trend);

  if (!trend.comparable) {
    console.log('No comparable previous release snapshot exists in quality-history/ yet.');
    return;
  }
  for (const comparison of trend.comparisons) {
    console.log(
      `${comparison.metric}: ${comparison.previous} -> ${comparison.current} (${comparison.classification})`,
    );
  }
}

const COMMANDS: Record<string, () => void> = {
  collect: cmdCollect,
  normalize: cmdNormalize,
  metrics: cmdMetrics,
  gates: cmdGates,
  score: cmdScore,
  report: cmdReport,
  release: cmdRelease,
  demo: cmdDemo,
  history: cmdHistory,
  trend: cmdTrend,
};

function main(): void {
  const command = process.argv[2];
  const handler = command !== undefined ? COMMANDS[command] : undefined;

  if (handler === undefined) {
    console.error(
      `Unknown quality command "${command ?? ''}". Expected one of: ${Object.keys(COMMANDS).join(', ')}`,
    );
    process.exitCode = 2;
    return;
  }

  try {
    handler();
  } catch (error) {
    if (error instanceof QualityEngineError) {
      logger.error({ err: error }, 'Quality engine error');
      console.error(`ENGINE_ERROR: ${error.message}`);
    } else {
      logger.error({ err: error }, 'Unexpected quality engine failure');
      console.error('ENGINE_ERROR: unexpected failure', error);
    }
    process.exitCode = 2;
  }
}

main();
