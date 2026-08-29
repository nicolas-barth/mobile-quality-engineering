import { ReleaseAssessment, ReleaseDecision } from '../types/decision';

export interface BadgeData {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
}

function colorForScore(score: number): string {
  if (score >= 90) {
    return 'brightgreen';
  }
  if (score >= 70) {
    return 'yellow';
  }
  return 'red';
}

function colorForDecision(decision: ReleaseDecision): string {
  switch (decision) {
    case ReleaseDecision.Go:
      return 'brightgreen';
    case ReleaseDecision.ConditionalGo:
      return 'yellow';
    case ReleaseDecision.NoGo:
      return 'red';
  }
}

export function buildQualityBadges(assessment: ReleaseAssessment): Record<string, BadgeData> {
  const flakyRate = assessment.metrics.reliability.flakyRate;

  return {
    score: {
      schemaVersion: 1,
      label: 'quality score',
      message: `${assessment.score}/100`,
      color: colorForScore(assessment.score),
    },
    release: {
      schemaVersion: 1,
      label: 'release',
      message: assessment.decisionLabel,
      color: colorForDecision(assessment.decision),
    },
    flaky: {
      schemaVersion: 1,
      label: 'flaky rate',
      message: flakyRate === null ? 'no evidence' : `${(flakyRate * 100).toFixed(1)}%`,
      color: flakyRate === null ? 'lightgrey' : flakyRate <= 0.02 ? 'brightgreen' : 'yellow',
    },
  };
}
