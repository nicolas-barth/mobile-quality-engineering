import {
  QualitySnapshot,
  TrendClassification,
  TrendMetricComparison,
  TrendReport,
} from '../types/trend';

interface MetricDefinition {
  key: keyof QualitySnapshot;
  higherIsBetter: boolean;
}

const METRIC_DEFINITIONS: MetricDefinition[] = [
  { key: 'score', higherIsBetter: true },
  { key: 'passRate', higherIsBetter: true },
  { key: 'criticalPathPassRate', higherIsBetter: true },
  { key: 'flakyRate', higherIsBetter: false },
  { key: 'crashCount', higherIsBetter: false },
  { key: 'anrCount', higherIsBetter: false },
  { key: 'securityCritical', higherIsBetter: false },
  { key: 'securityHigh', higherIsBetter: false },
  { key: 'accessibilityCritical', higherIsBetter: false },
  { key: 'visualFailures', higherIsBetter: false },
  { key: 'executedCoverageRate', higherIsBetter: true },
];

const STABLE_EPSILON = 1e-9;

function classify(delta: number, higherIsBetter: boolean): TrendClassification {
  if (Math.abs(delta) <= STABLE_EPSILON) {
    return 'STABLE';
  }
  const improved = higherIsBetter ? delta > 0 : delta < 0;
  return improved ? 'IMPROVED' : 'REGRESSED';
}

export function compareQualityTrend(
  previous: QualitySnapshot | undefined,
  current: QualitySnapshot,
): TrendReport {
  if (previous === undefined) {
    return { comparable: false, comparisons: [], regressions: [] };
  }

  const comparisons: TrendMetricComparison[] = METRIC_DEFINITIONS.map((definition) => {
    const previousValue = previous[definition.key];
    const currentValue = current[definition.key];

    if (typeof previousValue !== 'number' || typeof currentValue !== 'number') {
      return {
        metric: definition.key,
        previous: typeof previousValue === 'number' ? previousValue : null,
        current: typeof currentValue === 'number' ? currentValue : null,
        delta: null,
        classification: 'NOT_COMPARABLE',
      };
    }

    const delta = currentValue - previousValue;
    return {
      metric: definition.key,
      previous: previousValue,
      current: currentValue,
      delta,
      classification: classify(delta, definition.higherIsBetter),
    };
  });

  const regressions = comparisons
    .filter((comparison) => comparison.classification === 'REGRESSED')
    .map((comparison) => comparison.metric);

  return {
    comparable: true,
    previousReleaseId: previous.releaseId,
    previousAppVersion: previous.appVersion,
    comparisons,
    regressions,
  };
}
