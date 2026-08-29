import { CollectedEvidence } from './collectors';
import { calculateConfidence } from './decision/confidenceEngine';
import { decideRelease } from './decision/decisionEngine';
import { evaluateQualityGates } from './gates/gateEngine';
import { buildQualityMetrics } from './metrics';
import { loadQualityPolicies } from './policies/loadPolicy';
import { calculateResidualRisk } from './risk/riskModel';
import { calculateReleaseScore } from './scoring/scoreEngine';
import {
  QUALITY_SCHEMA_VERSION,
  RELEASE_DECISION_LABEL,
  ReleaseAssessment,
} from './types/decision';
import { PolicyProfileName } from './types/policy';
import { validateQualityExecution } from './validation/validateExecution';

export interface PipelineResult {
  assessment: ReleaseAssessment;
  evidence: CollectedEvidence;
}

export function assessQualityEvidence(
  evidence: CollectedEvidence,
  profileName: PolicyProfileName,
  root: string = process.cwd(),
): PipelineResult {
  validateQualityExecution(evidence.execution);

  const policies = loadQualityPolicies(root);
  const profile = policies.profiles[profileName];

  const metrics = buildQualityMetrics({
    results: evidence.execution.results,
    traceabilityEntries: evidence.raw.traceabilityEntries,
    stabilitySummary: evidence.raw.stabilitySummary,
    monkeyResult: evidence.raw.monkeyResult,
  });

  const gates = evaluateQualityGates({
    metrics,
    results: evidence.execution.results,
    findings: evidence.raw.findings,
    performanceMaxRegressionRatio: evidence.raw.performanceMaxRegressionRatio,
    gates: policies.gates,
    profile,
  });

  const { score, dimensions } = calculateReleaseScore(metrics, policies.weights);
  const risk = calculateResidualRisk(evidence.execution.results, gates, profile);
  const decisionResult = decideRelease({
    gates,
    metrics,
    score,
    profile,
    missingEvidencePolicy: policies.missingEvidence,
  });
  const confidence = calculateConfidence(gates, profile);

  const assessment: ReleaseAssessment = {
    schemaVersion: QUALITY_SCHEMA_VERSION,
    releaseId: evidence.execution.executionId,
    generatedAt: evidence.execution.completedAt,
    dataMode: evidence.execution.dataMode,
    appVersion: evidence.execution.appVersion,
    commitSha: evidence.execution.commitSha,
    branch: evidence.execution.branch,
    environment: evidence.execution.environment,
    policyProfile: profile.profile,
    decision: decisionResult.decision,
    decisionLabel: RELEASE_DECISION_LABEL[decisionResult.decision],
    confidence,
    score,
    minimumScore: profile.minimumScore,
    gates,
    metrics,
    dimensions,
    risk,
    blockers: decisionResult.blockers,
    warnings: decisionResult.warnings,
    conditions: decisionResult.conditions,
    recommendations: decisionResult.recommendations,
  };

  return { assessment, evidence };
}
