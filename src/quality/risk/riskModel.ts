import { QualityGateResult } from '../types/gate';
import { PolicyProfile } from '../types/policy';
import { QualityResult, QualityStatus } from '../types/result';
import { RESIDUAL_RISK_ORDER, ResidualRisk, RiskContributor, RiskLevel } from '../types/risk';

function levelForGate(gate: QualityGateResult): RiskLevel {
  return gate.blocking ? 'CRITICAL' : 'HIGH';
}

function levelRank(level: RiskLevel): number {
  return RESIDUAL_RISK_ORDER.indexOf(level);
}

export function calculateResidualRisk(
  results: QualityResult[],
  gates: QualityGateResult[],
  profile: PolicyProfile,
): ResidualRisk {
  const contributors: RiskContributor[] = [];

  for (const gate of gates) {
    if (gate.status === 'FAIL') {
      contributors.push({
        description: `${gate.name} failed: expected ${gate.expected}, got ${gate.actual}`,
        level: levelForGate(gate),
        category: gate.category,
      });
    } else if (
      gate.status === 'NOT_EVALUATED' &&
      profile.requiredCategories.includes(gate.category)
    ) {
      contributors.push({
        description: `${gate.name} could not be evaluated: ${gate.reason}`,
        level: 'MEDIUM',
        category: gate.category,
      });
    }
  }

  const failedP0Results = results.filter(
    (result) => result.priority === 'P0' && result.status === QualityStatus.Failed,
  );
  for (const failed of failedP0Results.slice(0, 5)) {
    contributors.push({
      description: `P0 test failed: ${failed.suite}${failed.test !== undefined ? ` > ${failed.test}` : ''}`,
      level: 'CRITICAL',
      traceId: failed.traceId,
      category: failed.category,
    });
  }

  const compatibilityGate = gates.find((gate) => gate.id === 'compatibilityMandatoryProfiles');
  if (compatibilityGate?.status === 'FAIL' && profile.mandatoryCompatibilityProfiles.length > 0) {
    contributors.push({
      description: `Compatibility validated on only ${compatibilityGate.actual} of ${profile.mandatoryCompatibilityProfiles.length} mandatory profiles`,
      level: 'MEDIUM',
      category: 'COMPATIBILITY',
    });
  }

  const level = contributors.reduce<RiskLevel>(
    (worst, contributor) =>
      levelRank(contributor.level) > levelRank(worst) ? contributor.level : worst,
    'LOW',
  );

  return { level, contributors };
}
