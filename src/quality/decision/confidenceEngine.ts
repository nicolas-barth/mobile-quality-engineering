import { AssessmentConfidence } from '../types/decision';
import { QualityGateResult } from '../types/gate';
import { PolicyProfile } from '../types/policy';

export function calculateConfidence(
  gates: QualityGateResult[],
  profile: PolicyProfile,
): AssessmentConfidence {
  const requiredGates = gates.filter((gate) => profile.requiredCategories.includes(gate.category));

  if (requiredGates.length === 0) {
    return 'MEDIUM';
  }

  const evaluatedRequiredGates = requiredGates.filter((gate) => gate.status !== 'NOT_EVALUATED');
  const completeness = evaluatedRequiredGates.length / requiredGates.length;

  if (completeness >= 0.9) {
    return 'HIGH';
  }
  if (completeness >= 0.6) {
    return 'MEDIUM';
  }
  return 'LOW';
}
