import { ReleaseIssue } from '../types/decision';
import { QualityMetrics } from '../types/metrics';
import {
  MissingEvidenceBehavior,
  MissingEvidencePolicyConfig,
  PolicyProfile,
} from '../types/policy';

function executedCountForCategory(metrics: QualityMetrics, category: string): number {
  if (category === 'CRITICAL_PATH') {
    return metrics.criticalPath.executed;
  }
  return metrics.category[category]?.executed ?? 0;
}

function resolveBehavior(
  category: string,
  profile: PolicyProfile,
  missingEvidencePolicy: MissingEvidencePolicyConfig,
): MissingEvidenceBehavior {
  return (
    profile.missingEvidenceOverrides[category] ??
    missingEvidencePolicy.categories[category] ??
    'WARNING'
  );
}

export interface MissingEvidenceEvaluation {
  blockers: ReleaseIssue[];
  warnings: ReleaseIssue[];
}

export function evaluateMissingEvidence(
  metrics: QualityMetrics,
  profile: PolicyProfile,
  missingEvidencePolicy: MissingEvidencePolicyConfig,
): MissingEvidenceEvaluation {
  const blockers: ReleaseIssue[] = [];
  const warnings: ReleaseIssue[] = [];

  for (const category of profile.requiredCategories) {
    const executed = executedCountForCategory(metrics, category);
    if (executed > 0) {
      continue;
    }

    const behavior = resolveBehavior(category, profile, missingEvidencePolicy);
    if (behavior === 'IGNORE' || behavior === 'NOT_EVALUATED') {
      continue;
    }

    const issue: ReleaseIssue = {
      code: 'MISSING_EVIDENCE',
      message: `Required evidence for ${category} is missing for the ${profile.profile} profile`,
      category,
    };

    if (behavior === 'BLOCK') {
      blockers.push(issue);
    } else {
      warnings.push(issue);
    }
  }

  return { blockers, warnings };
}
