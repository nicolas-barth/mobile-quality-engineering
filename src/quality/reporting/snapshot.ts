import { Finding, FindingSeverity } from '../../types/finding';
import { QUALITY_SCHEMA_VERSION, ReleaseAssessment } from '../types/decision';
import { QualitySnapshot } from '../types/trend';

export interface SnapshotSecurityCounts {
  critical: number;
  high: number;
}

export function countSecurityFindingsBySeverity(findings: Finding[]): SnapshotSecurityCounts {
  const relevant = findings.filter((finding) => finding.status !== 'not-a-defect');
  return {
    critical: relevant.filter((finding) => finding.severity === FindingSeverity.Critical).length,
    high: relevant.filter((finding) => finding.severity === FindingSeverity.High).length,
  };
}

export function buildQualitySnapshot(
  assessment: ReleaseAssessment,
  security: SnapshotSecurityCounts,
): QualitySnapshot {
  return {
    schemaVersion: QUALITY_SCHEMA_VERSION,
    releaseId: assessment.releaseId,
    generatedAt: assessment.generatedAt,
    appVersion: assessment.appVersion,
    decision: assessment.decision,
    score: assessment.score,
    confidence: assessment.confidence,
    passRate: assessment.metrics.execution.passRate,
    criticalPathPassRate:
      assessment.metrics.criticalPath.executed > 0
        ? assessment.metrics.criticalPath.passRate
        : null,
    flakyRate: assessment.metrics.reliability.flakyRate,
    crashCount: assessment.metrics.reliability.crashCount,
    anrCount: assessment.metrics.reliability.anrCount,
    securityCritical: security.critical,
    securityHigh: security.high,
    accessibilityCritical: assessment.metrics.category.ACCESSIBILITY?.failed ?? 0,
    visualFailures: assessment.metrics.category.VISUAL?.failed ?? 0,
    executedCoverageRate: assessment.metrics.coverage.executedCoverageRate,
  };
}
