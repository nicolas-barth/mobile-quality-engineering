import { ReleaseDecision, ReleaseIssue } from '../types/decision';
import { QualityGateResult } from '../types/gate';
import { QualityMetrics } from '../types/metrics';
import { MissingEvidencePolicyConfig, PolicyProfile } from '../types/policy';

import { evaluateMissingEvidence } from './missingEvidence';
import { generateRecommendations } from './recommendationsEngine';

export interface DecisionInput {
  gates: QualityGateResult[];
  metrics: QualityMetrics;
  score: number;
  profile: PolicyProfile;
  missingEvidencePolicy: MissingEvidencePolicyConfig;
}

export interface DecisionResult {
  decision: ReleaseDecision;
  blockers: ReleaseIssue[];
  warnings: ReleaseIssue[];
  conditions: string[];
  recommendations: string[];
}

function gateIssue(gate: QualityGateResult): ReleaseIssue {
  return {
    code: 'GATE_FAILED',
    message: `${gate.name} failed: expected ${gate.expected}, got ${gate.actual} (${gate.reason})`,
    category: gate.category,
    gateId: gate.id,
  };
}

export function decideRelease(input: DecisionInput): DecisionResult {
  const failedGates = input.gates.filter((gate) => gate.status === 'FAIL');
  const gateBlockers = failedGates.filter((gate) => gate.blocking).map(gateIssue);
  const gateWarnings = failedGates.filter((gate) => !gate.blocking).map(gateIssue);

  const missingEvidence = evaluateMissingEvidence(
    input.metrics,
    input.profile,
    input.missingEvidencePolicy,
  );

  const blockers = [...gateBlockers, ...missingEvidence.blockers];
  const warnings = [...gateWarnings, ...missingEvidence.warnings];

  if (input.score < input.profile.minimumScore) {
    warnings.push({
      code: 'SCORE_BELOW_MINIMUM',
      message: `Release readiness score ${input.score} is below the ${input.profile.profile} profile minimum of ${input.profile.minimumScore}`,
      category: 'SCORE',
    });
  }

  let decision: ReleaseDecision;
  if (blockers.length > 0) {
    decision = ReleaseDecision.NoGo;
  } else if (warnings.length > 0) {
    decision = ReleaseDecision.ConditionalGo;
  } else {
    decision = ReleaseDecision.Go;
  }

  const conditions =
    decision === ReleaseDecision.ConditionalGo ? warnings.map((warning) => warning.message) : [];
  const recommendations = generateRecommendations(input.gates);

  return { decision, blockers, warnings, conditions, recommendations };
}
