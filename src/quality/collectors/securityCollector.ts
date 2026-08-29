import fs from 'node:fs';

import { Finding, FindingSeverity } from '../../types/finding';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';
import { QualityEngineError } from '../validation/errors';
import { resolveWithinRoot } from '../validation/safePath';

interface SecuritySummary {
  generatedAt: string;
  disclaimer: string;
  findings: Finding[];
}

const VALID_SEVERITIES = new Set<string>(Object.values(FindingSeverity));
const VALID_FINDING_STATUSES = new Set(['open', 'confirmed', 'testability-issue', 'not-a-defect']);

function isFinding(value: unknown): value is Finding {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.severity === 'string' &&
    VALID_SEVERITIES.has(candidate.severity) &&
    typeof candidate.status === 'string' &&
    VALID_FINDING_STATUSES.has(candidate.status)
  );
}

function isSecuritySummary(value: unknown): value is SecuritySummary {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.generatedAt === 'string' &&
    Array.isArray(candidate.findings) &&
    candidate.findings.every(isFinding)
  );
}

export function isDependencyFinding(finding: Finding): boolean {
  return finding.id.startsWith('SEC-DEP-');
}

function severityRank(severity: FindingSeverity): number {
  const order: FindingSeverity[] = [
    FindingSeverity.Info,
    FindingSeverity.Low,
    FindingSeverity.Medium,
    FindingSeverity.High,
    FindingSeverity.Critical,
  ];
  return order.indexOf(severity);
}

function statusForFinding(finding: Finding): QualityStatus {
  if (finding.status === 'not-a-defect') {
    return QualityStatus.Passed;
  }
  return severityRank(finding.severity) >= severityRank(FindingSeverity.High)
    ? QualityStatus.Failed
    : QualityStatus.Warning;
}

export interface SecurityCollectorOptions {
  summaryPath?: string;
  executionId: string;
  timestamp: string;
}

export interface SecurityCollectorOutput {
  results: QualityResult[];
  findings: Finding[];
  hasEvidence: boolean;
}

export function collectSecurityResults(
  root: string,
  options: SecurityCollectorOptions,
): SecurityCollectorOutput {
  const summaryPath = resolveWithinRoot(
    root,
    options.summaryPath ?? 'reports/security/summary.json',
  );

  if (!fs.existsSync(summaryPath)) {
    return { results: [], findings: [], hasEvidence: false };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  } catch (error) {
    throw new QualityEngineError('Could not parse reports/security/summary.json', error);
  }

  if (!isSecuritySummary(raw)) {
    throw new QualityEngineError(
      'reports/security/summary.json is missing required fields (generatedAt, findings), ' +
        'or one of its findings has an invalid or missing severity/status',
    );
  }

  const findingResults: QualityResult[] = raw.findings.map((finding) => ({
    id: `security-${options.executionId}-${finding.id}`,
    executionId: options.executionId,
    timestamp: options.timestamp,
    source: QualitySource.Security,
    category: QualityCategory.Security,
    suite: 'security-scan',
    test: finding.id,
    status: statusForFinding(finding),
    failureMessage: statusForFinding(finding) !== QualityStatus.Passed ? finding.title : undefined,
    traceId: finding.id,
  }));

  const worstStatus = findingResults.reduce<QualityStatus>((worst, current) => {
    if (worst === QualityStatus.Failed || current.status === QualityStatus.Failed) {
      return QualityStatus.Failed;
    }
    if (worst === QualityStatus.Warning || current.status === QualityStatus.Warning) {
      return QualityStatus.Warning;
    }
    return QualityStatus.Passed;
  }, QualityStatus.Passed);

  const summaryResult: QualityResult = {
    id: `security-${options.executionId}-summary`,
    executionId: options.executionId,
    timestamp: options.timestamp,
    source: QualitySource.Security,
    category: QualityCategory.Security,
    suite: 'security-scan',
    status: worstStatus,
    failureMessage:
      worstStatus !== QualityStatus.Passed
        ? `${raw.findings.length} security finding(s) recorded, worst status ${worstStatus}`
        : undefined,
  };

  return { results: [summaryResult, ...findingResults], findings: raw.findings, hasEvidence: true };
}
