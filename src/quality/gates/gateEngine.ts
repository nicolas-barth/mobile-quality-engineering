import { Finding, FindingSeverity } from '../../types/finding';
import { isDependencyFinding } from '../collectors/securityCollector';
import { GateStatus, QualityGateResult } from '../types/gate';
import { QualityMetrics } from '../types/metrics';
import { GateThreshold, PolicyProfile, QualityGatesConfig } from '../types/policy';
import { QualityResult, QualityStatus } from '../types/result';

export interface GateEvaluationInput {
  metrics: QualityMetrics;
  results: QualityResult[];
  findings: Finding[];
  performanceMaxRegressionRatio?: number;
  gates: QualityGatesConfig;
  profile: PolicyProfile;
}

function resolveThreshold(
  gates: QualityGatesConfig,
  profile: PolicyProfile,
  id: string,
): GateThreshold {
  const base = gates[id];
  if (base === undefined) {
    throw new Error(`Policy profile "${profile.profile}" enables unknown gate "${id}"`);
  }
  const override = profile.gateOverrides[id];
  return override?.blocking === undefined ? base : { ...base, blocking: override.blocking };
}

function buildGate(
  id: string,
  name: string,
  category: string,
  status: GateStatus,
  expected: string,
  actual: string,
  reason: string,
  blocking: boolean,
): QualityGateResult {
  return { id, name, category, status, expected, actual, reason, blocking };
}

function countBySeverity(
  findings: Finding[],
  severity: FindingSeverity,
  dependencyOnly?: boolean,
): number {
  return findings.filter((finding) => {
    if (finding.severity !== severity || finding.status === 'not-a-defect') {
      return false;
    }
    if (dependencyOnly === undefined) {
      return true;
    }
    return isDependencyFinding(finding) === dependencyOnly;
  }).length;
}

export function evaluateQualityGates(input: GateEvaluationInput): QualityGateResult[] {
  const { metrics, results, findings, gates, profile } = input;
  const enabled = new Set(profile.enabledGates);
  const evaluated: QualityGateResult[] = [];
  const threshold = (id: string): GateThreshold => resolveThreshold(gates, profile, id);

  if (enabled.has('p0Failures')) {
    const def = threshold('p0Failures');
    const p0 = metrics.priority.P0;
    const status: GateStatus =
      p0.executed === 0 ? 'NOT_EVALUATED' : p0.failed <= def.max! ? 'PASS' : 'FAIL';
    evaluated.push(
      buildGate(
        'p0Failures',
        'P0 failures',
        'FUNCTIONAL',
        status,
        `<= ${def.max}`,
        `${p0.failed}`,
        status === 'NOT_EVALUATED'
          ? 'No P0-priority tests were executed'
          : `${p0.failed} of ${p0.executed} executed P0 tests failed`,
        def.blocking,
      ),
    );
  }

  if (enabled.has('criticalPathPassRate')) {
    const def = threshold('criticalPathPassRate');
    const cp = metrics.criticalPath;
    const status: GateStatus =
      cp.executed === 0 ? 'NOT_EVALUATED' : cp.passRate >= def.min! ? 'PASS' : 'FAIL';
    evaluated.push(
      buildGate(
        'criticalPathPassRate',
        'Critical path pass rate',
        'CRITICAL_PATH',
        status,
        `>= ${(def.min! * 100).toFixed(0)}%`,
        `${(cp.passRate * 100).toFixed(1)}%`,
        status === 'NOT_EVALUATED'
          ? 'No critical-path tests were executed'
          : `${cp.passed} of ${cp.executed} executed critical-path tests passed`,
        def.blocking,
      ),
    );
  }

  if (enabled.has('functionalPassRate')) {
    const def = threshold('functionalPassRate');
    const functional = metrics.category.FUNCTIONAL;
    const status: GateStatus =
      functional === undefined || functional.executed === 0
        ? 'NOT_EVALUATED'
        : functional.passRate >= def.min!
          ? 'PASS'
          : 'FAIL';
    evaluated.push(
      buildGate(
        'functionalPassRate',
        'Functional pass rate',
        'FUNCTIONAL',
        status,
        `>= ${(def.min! * 100).toFixed(0)}%`,
        functional !== undefined ? `${(functional.passRate * 100).toFixed(1)}%` : 'no evidence',
        status === 'NOT_EVALUATED'
          ? 'No functional tests were executed'
          : `${functional!.passed} of ${functional!.executed} executed functional tests passed`,
        def.blocking,
      ),
    );
  }

  if (enabled.has('crashCount')) {
    const def = threshold('crashCount');
    const status: GateStatus = !metrics.reliability.hasStabilityEvidence
      ? 'NOT_EVALUATED'
      : metrics.reliability.crashCount <= def.max!
        ? 'PASS'
        : 'FAIL';
    evaluated.push(
      buildGate(
        'crashCount',
        'Crash count',
        'STABILITY',
        status,
        `<= ${def.max}`,
        `${metrics.reliability.crashCount}`,
        status === 'NOT_EVALUATED'
          ? 'No stability/Monkey evidence exists'
          : 'From the latest Monkey run',
        def.blocking,
      ),
    );
  }

  if (enabled.has('anrCount')) {
    const def = threshold('anrCount');
    const status: GateStatus = !metrics.reliability.hasStabilityEvidence
      ? 'NOT_EVALUATED'
      : metrics.reliability.anrCount <= def.max!
        ? 'PASS'
        : 'FAIL';
    evaluated.push(
      buildGate(
        'anrCount',
        'ANR count',
        'STABILITY',
        status,
        `<= ${def.max}`,
        `${metrics.reliability.anrCount}`,
        status === 'NOT_EVALUATED'
          ? 'No stability/Monkey evidence exists'
          : 'From the latest Monkey run',
        def.blocking,
      ),
    );
  }

  if (enabled.has('flakyRate')) {
    const def = threshold('flakyRate');
    const flakyRate = metrics.reliability.flakyRate;
    const status: GateStatus =
      flakyRate === null ? 'NOT_EVALUATED' : flakyRate <= def.max! ? 'PASS' : 'FAIL';
    evaluated.push(
      buildGate(
        'flakyRate',
        'Flaky rate',
        'STABILITY',
        status,
        `<= ${(def.max! * 100).toFixed(0)}%`,
        flakyRate === null ? 'no evidence' : `${(flakyRate * 100).toFixed(1)}%`,
        status === 'NOT_EVALUATED'
          ? 'No stability-repeat evidence exists'
          : 'From the latest stability-repeat run',
        def.blocking,
      ),
    );
  }

  if (enabled.has('securityCritical')) {
    const def = threshold('securityCritical');
    const criticalCount = countBySeverity(findings, FindingSeverity.Critical);
    const status: GateStatus =
      metrics.category.SECURITY === undefined
        ? 'NOT_EVALUATED'
        : criticalCount <= def.max!
          ? 'PASS'
          : 'FAIL';
    evaluated.push(
      buildGate(
        'securityCritical',
        'Critical security findings',
        'SECURITY',
        status,
        `<= ${def.max}`,
        `${criticalCount}`,
        status === 'NOT_EVALUATED'
          ? 'No security scan evidence exists'
          : 'From the latest security scan',
        def.blocking,
      ),
    );
  }

  if (enabled.has('securityHighDependency')) {
    const def = threshold('securityHighDependency');
    const count = countBySeverity(findings, FindingSeverity.High, true);
    const status: GateStatus =
      metrics.category.SECURITY === undefined
        ? 'NOT_EVALUATED'
        : count <= def.max!
          ? 'PASS'
          : 'FAIL';
    evaluated.push(
      buildGate(
        'securityHighDependency',
        'High-severity dependency findings',
        'SECURITY',
        status,
        `<= ${def.max}`,
        `${count}`,
        status === 'NOT_EVALUATED'
          ? 'No security scan evidence exists'
          : 'npm audit high-severity findings',
        def.blocking,
      ),
    );
  }

  if (enabled.has('securityHighProduct')) {
    const def = threshold('securityHighProduct');
    const count = countBySeverity(findings, FindingSeverity.High, false);
    const status: GateStatus =
      metrics.category.SECURITY === undefined
        ? 'NOT_EVALUATED'
        : count <= def.max!
          ? 'PASS'
          : 'FAIL';
    evaluated.push(
      buildGate(
        'securityHighProduct',
        'High-severity product findings',
        'SECURITY',
        status,
        `<= ${def.max}`,
        `${count}`,
        status === 'NOT_EVALUATED'
          ? 'No security scan evidence exists'
          : 'Secret scan and manifest/component findings, excluding dependency vulnerabilities',
        def.blocking,
      ),
    );
  }

  if (enabled.has('accessibilityCritical')) {
    const def = threshold('accessibilityCritical');
    const accessibility = metrics.category.ACCESSIBILITY;
    const status: GateStatus =
      accessibility === undefined || accessibility.executed === 0
        ? 'NOT_EVALUATED'
        : accessibility.failed <= def.max!
          ? 'PASS'
          : 'FAIL';
    evaluated.push(
      buildGate(
        'accessibilityCritical',
        'Accessibility defects',
        'ACCESSIBILITY',
        status,
        `<= ${def.max}`,
        accessibility !== undefined ? `${accessibility.failed}` : 'no evidence',
        status === 'NOT_EVALUATED'
          ? 'No accessibility tests were executed'
          : 'Failed accessibility checks',
        def.blocking,
      ),
    );
  }

  if (enabled.has('visualRegressionFailures')) {
    const def = threshold('visualRegressionFailures');
    const visual = metrics.category.VISUAL;
    const status: GateStatus =
      visual === undefined || visual.executed === 0
        ? 'NOT_EVALUATED'
        : visual.failed <= def.max!
          ? 'PASS'
          : 'FAIL';
    evaluated.push(
      buildGate(
        'visualRegressionFailures',
        'Unapproved visual regressions',
        'VISUAL',
        status,
        `<= ${def.max}`,
        visual !== undefined ? `${visual.failed}` : 'no evidence',
        status === 'NOT_EVALUATED'
          ? 'No visual regression tests were executed'
          : 'Failed visual comparisons',
        def.blocking,
      ),
    );
  }

  if (enabled.has('installationCriticalPassRate')) {
    const def = threshold('installationCriticalPassRate');
    const installation = metrics.category.INSTALLATION;
    const status: GateStatus =
      installation === undefined || installation.executed === 0
        ? 'NOT_EVALUATED'
        : installation.passRate >= def.min!
          ? 'PASS'
          : 'FAIL';
    evaluated.push(
      buildGate(
        'installationCriticalPassRate',
        'Installation pass rate',
        'INSTALLATION',
        status,
        `>= ${(def.min! * 100).toFixed(0)}%`,
        installation !== undefined ? `${(installation.passRate * 100).toFixed(1)}%` : 'no evidence',
        status === 'NOT_EVALUATED'
          ? 'No installation tests were executed'
          : 'Clean install/uninstall suite',
        def.blocking,
      ),
    );
  }

  if (enabled.has('compatibilityMandatoryProfiles')) {
    const def = threshold('compatibilityMandatoryProfiles');
    const mandatoryProfiles = profile.mandatoryCompatibilityProfiles;

    if (mandatoryProfiles.length === 0) {
      evaluated.push(
        buildGate(
          'compatibilityMandatoryProfiles',
          'Mandatory compatibility profiles',
          'COMPATIBILITY',
          'NOT_EVALUATED',
          `>= 1`,
          '0/0',
          'No mandatory compatibility profiles are configured for this policy profile',
          def.blocking,
        ),
      );
    } else {
      const executedProfiles = mandatoryProfiles.filter((name) =>
        results.some((result) => result.environment?.compatibilityProfile === name),
      );
      const passedProfiles = executedProfiles.filter(
        (name) =>
          !results.some(
            (result) =>
              result.environment?.compatibilityProfile === name &&
              result.status === QualityStatus.Failed,
          ),
      );

      const status: GateStatus =
        executedProfiles.length === 0
          ? 'NOT_EVALUATED'
          : passedProfiles.length === mandatoryProfiles.length
            ? 'PASS'
            : 'FAIL';

      evaluated.push(
        buildGate(
          'compatibilityMandatoryProfiles',
          'Mandatory compatibility profiles',
          'COMPATIBILITY',
          status,
          `${mandatoryProfiles.length}/${mandatoryProfiles.length} mandatory profiles passing`,
          `${passedProfiles.length}/${mandatoryProfiles.length}`,
          status === 'NOT_EVALUATED'
            ? `None of the mandatory profiles (${mandatoryProfiles.join(', ')}) executed`
            : `Executed: ${executedProfiles.join(', ') || 'none'}`,
          def.blocking,
        ),
      );
    }
  }

  if (enabled.has('performanceRegression')) {
    const def = threshold('performanceRegression');
    const ratio = input.performanceMaxRegressionRatio;
    const status: GateStatus =
      ratio === undefined ? 'NOT_EVALUATED' : ratio <= def.max! ? 'PASS' : 'FAIL';
    evaluated.push(
      buildGate(
        'performanceRegression',
        'Performance regression',
        'PERFORMANCE',
        status,
        `<= ${(def.max! * 100).toFixed(0)}%`,
        ratio === undefined ? 'no trusted baseline configured' : `${(ratio * 100).toFixed(1)}%`,
        status === 'NOT_EVALUATED'
          ? 'No performance baseline is configured; refusing to gate on an arbitrary absolute value'
          : 'Worst-case functional timing regression against the configured baseline',
        def.blocking,
      ),
    );
  }

  return evaluated;
}
