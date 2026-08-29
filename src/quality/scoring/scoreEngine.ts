import { CategoryMetrics, QualityMetrics } from '../types/metrics';
import { QualityWeightsConfig } from '../types/policy';
import { QualityCategory } from '../types/result';
import { EvidenceStatus, QualityDimensionScore, ScoreResult } from '../types/score';

interface PooledCategory {
  executed: number;
  passed: number;
  presentCount: number;
}

function poolCategories(category: CategoryMetrics, categories: QualityCategory[]): PooledCategory {
  const relevant = categories.map((name) => category[name]).filter((entry) => entry !== undefined);
  return {
    executed: relevant.reduce((sum, entry) => sum + entry.executed, 0),
    passed: relevant.reduce((sum, entry) => sum + entry.passed, 0),
    presentCount: relevant.length,
  };
}

function scorePooledDimension(
  dimension: string,
  weight: number,
  pooled: PooledCategory,
  totalConstituents: number,
): QualityDimensionScore {
  if (pooled.executed === 0) {
    return {
      category: dimension,
      weight,
      score: 0,
      maxScore: weight,
      evidenceStatus: 'UNAVAILABLE',
      reason: 'No evidence was executed for this dimension',
    };
  }

  const passRate = pooled.passed / pooled.executed;
  const evidenceStatus: EvidenceStatus =
    pooled.presentCount >= totalConstituents ? 'AVAILABLE' : 'PARTIAL';

  return {
    category: dimension,
    weight,
    score: Math.round(weight * passRate * 100) / 100,
    maxScore: weight,
    evidenceStatus,
    reason: `${pooled.passed} of ${pooled.executed} executed tests passed (${(passRate * 100).toFixed(1)}%)`,
  };
}

function scoreCriticalPath(weight: number, metrics: QualityMetrics): QualityDimensionScore {
  const cp = metrics.criticalPath;
  if (cp.executed === 0) {
    return {
      category: 'CRITICAL_PATH',
      weight,
      score: 0,
      maxScore: weight,
      evidenceStatus: 'UNAVAILABLE',
      reason: 'No critical-path tests were executed',
    };
  }
  return {
    category: 'CRITICAL_PATH',
    weight,
    score: Math.round(weight * cp.passRate * 100) / 100,
    maxScore: weight,
    evidenceStatus: 'AVAILABLE',
    reason: `${cp.passed} of ${cp.executed} executed critical-path tests passed (${(cp.passRate * 100).toFixed(1)}%)`,
  };
}

function scoreStability(weight: number, metrics: QualityMetrics): QualityDimensionScore {
  const reliability = metrics.reliability;
  if (!reliability.hasStabilityEvidence) {
    return {
      category: 'STABILITY',
      weight,
      score: 0,
      maxScore: weight,
      evidenceStatus: 'UNAVAILABLE',
      reason: 'No stability-repeat or Monkey evidence exists',
    };
  }

  const crashOrAnr = reliability.crashCount > 0 || reliability.anrCount > 0;
  const finalPassRate = reliability.finalPassRate ?? 0;
  const score = crashOrAnr ? 0 : Math.round(weight * finalPassRate * 100) / 100;

  return {
    category: 'STABILITY',
    weight,
    score,
    maxScore: weight,
    evidenceStatus: 'AVAILABLE',
    reason: `${reliability.crashCount} crash(es), ${reliability.anrCount} ANR(s), flaky rate ${((reliability.flakyRate ?? 0) * 100).toFixed(1)}%, final pass rate ${(finalPassRate * 100).toFixed(1)}%`,
  };
}

export function calculateReleaseScore(
  metrics: QualityMetrics,
  weightsConfig: QualityWeightsConfig,
): ScoreResult {
  const weights = weightsConfig.weights;
  const dimensions: QualityDimensionScore[] = [];

  if (weights.FUNCTIONAL !== undefined) {
    dimensions.push(
      scorePooledDimension(
        'FUNCTIONAL',
        weights.FUNCTIONAL,
        poolCategories(metrics.category, [
          QualityCategory.Functional,
          QualityCategory.DeviceBehavior,
        ]),
        2,
      ),
    );
  }
  if (weights.CRITICAL_PATH !== undefined) {
    dimensions.push(scoreCriticalPath(weights.CRITICAL_PATH, metrics));
  }
  if (weights.STABILITY !== undefined) {
    dimensions.push(scoreStability(weights.STABILITY, metrics));
  }
  if (weights.COMPATIBILITY !== undefined) {
    dimensions.push(
      scorePooledDimension(
        'COMPATIBILITY',
        weights.COMPATIBILITY,
        poolCategories(metrics.category, [QualityCategory.Compatibility]),
        1,
      ),
    );
  }
  if (weights.ACCESSIBILITY !== undefined) {
    dimensions.push(
      scorePooledDimension(
        'ACCESSIBILITY',
        weights.ACCESSIBILITY,
        poolCategories(metrics.category, [QualityCategory.Accessibility]),
        1,
      ),
    );
  }
  if (weights.SECURITY !== undefined) {
    dimensions.push(
      scorePooledDimension(
        'SECURITY',
        weights.SECURITY,
        poolCategories(metrics.category, [QualityCategory.Security]),
        1,
      ),
    );
  }
  if (weights.VISUAL !== undefined) {
    dimensions.push(
      scorePooledDimension(
        'VISUAL',
        weights.VISUAL,
        poolCategories(metrics.category, [QualityCategory.Visual]),
        1,
      ),
    );
  }
  if (weights.INSTALLATION !== undefined) {
    dimensions.push(
      scorePooledDimension(
        'INSTALLATION',
        weights.INSTALLATION,
        poolCategories(metrics.category, [QualityCategory.Installation, QualityCategory.Upgrade]),
        2,
      ),
    );
  }
  if (weights.PERFORMANCE !== undefined) {
    dimensions.push(
      scorePooledDimension(
        'PERFORMANCE',
        weights.PERFORMANCE,
        poolCategories(metrics.category, [QualityCategory.Performance]),
        1,
      ),
    );
  }

  const score = Math.round(dimensions.reduce((sum, dimension) => sum + dimension.score, 0));

  return { score, dimensions };
}
