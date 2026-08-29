import { describe, expect, it } from 'vitest';

import { Finding, FindingSeverity } from '../../types/finding';
import { buildQualityMetrics } from '../metrics';
import { loadQualityPolicies } from '../policies/loadPolicy';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';

import { evaluateQualityGates } from './gateEngine';

function result(overrides: Partial<QualityResult>): QualityResult {
  return {
    id: `r-${Math.random()}`,
    executionId: 'exec-1',
    timestamp: '2026-08-15T10:00:00.000Z',
    source: QualitySource.Junit,
    category: QualityCategory.Functional,
    suite: 'smoke',
    status: QualityStatus.Passed,
    ...overrides,
  };
}

function securityScanRanResult(): QualityResult {
  return result({
    source: QualitySource.Security,
    category: QualityCategory.Security,
    suite: 'security-scan',
  });
}

function finding(overrides: Partial<Finding>): Finding {
  return {
    id: 'SEC-SECRET-1',
    category: 'security',
    severity: FindingSeverity.High,
    title: 'x',
    description: 'x',
    status: 'open',
    ...overrides,
  };
}

const policies = loadQualityPolicies(process.cwd());

describe('evaluateQualityGates', () => {
  it('marks p0Failures NOT_EVALUATED when no P0 tests executed, and only the gates the profile enables appear', () => {
    const results = [result({ category: QualityCategory.Functional, priority: 'P1' })];
    const metrics = buildQualityMetrics({ results, traceabilityEntries: [] });

    const gates = evaluateQualityGates({
      metrics,
      results,
      findings: [],
      gates: policies.gates,
      profile: policies.profiles.PR,
    });

    const p0Gate = gates.find((gate) => gate.id === 'p0Failures');
    expect(p0Gate?.status).toBe('NOT_EVALUATED');
    expect(gates.every((gate) => policies.profiles.PR.enabledGates.includes(gate.id))).toBe(true);
  });

  it('fails the blocking p0Failures gate when a P0 test fails, and passes it otherwise', () => {
    const failing = [
      result({ priority: 'P0', status: QualityStatus.Failed }),
      result({ priority: 'P0', status: QualityStatus.Passed }),
    ];
    const metricsFail = buildQualityMetrics({ results: failing, traceabilityEntries: [] });
    const gatesFail = evaluateQualityGates({
      metrics: metricsFail,
      results: failing,
      findings: [],
      gates: policies.gates,
      profile: policies.profiles.PR,
    });
    expect(gatesFail.find((gate) => gate.id === 'p0Failures')).toMatchObject({
      status: 'FAIL',
      blocking: true,
    });

    const passing = [result({ priority: 'P0', status: QualityStatus.Passed })];
    const metricsPass = buildQualityMetrics({ results: passing, traceabilityEntries: [] });
    const gatesPass = evaluateQualityGates({
      metrics: metricsPass,
      results: passing,
      findings: [],
      gates: policies.gates,
      profile: policies.profiles.PR,
    });
    expect(gatesPass.find((gate) => gate.id === 'p0Failures')?.status).toBe('PASS');
  });

  it('treats the flaky-rate gate as a non-blocking warning-capable gate that is NOT_EVALUATED with no stability evidence', () => {
    const gates = evaluateQualityGates({
      metrics: buildQualityMetrics({ results: [], traceabilityEntries: [] }),
      results: [],
      findings: [],
      gates: policies.gates,
      profile: policies.profiles.NIGHTLY,
    });
    const flakyGate = gates.find((gate) => gate.id === 'flakyRate');
    expect(flakyGate?.status).toBe('NOT_EVALUATED');
    expect(flakyGate?.blocking).toBe(false);
  });

  it('distinguishes HIGH dependency findings (warning-capable) from HIGH product findings (blocking)', () => {
    const scanRan = [securityScanRanResult()];
    const findings = [finding({ id: 'SEC-DEP-high', severity: FindingSeverity.High })];
    const gates = evaluateQualityGates({
      metrics: buildQualityMetrics({ results: scanRan, traceabilityEntries: [] }),
      results: scanRan,
      findings,
      gates: policies.gates,
      profile: policies.profiles.RELEASE,
    });

    expect(gates.find((gate) => gate.id === 'securityHighDependency')).toMatchObject({
      status: 'PASS',
    });
    expect(gates.find((gate) => gate.id === 'securityHighProduct')).toMatchObject({
      status: 'PASS',
    });

    const productFindings = [finding({ id: 'SEC-SECRET-1', severity: FindingSeverity.High })];
    const gatesWithProductFinding = evaluateQualityGates({
      metrics: buildQualityMetrics({ results: scanRan, traceabilityEntries: [] }),
      results: scanRan,
      findings: productFindings,
      gates: policies.gates,
      profile: policies.profiles.RELEASE,
    });
    expect(gatesWithProductFinding.find((gate) => gate.id === 'securityHighProduct')).toMatchObject(
      {
        status: 'FAIL',
        blocking: true,
      },
    );
  });

  it('marks the security gates NOT_EVALUATED when the scan never ran, even with an empty findings array', () => {
    const gates = evaluateQualityGates({
      metrics: buildQualityMetrics({ results: [], traceabilityEntries: [] }),
      results: [],
      findings: [],
      gates: policies.gates,
      profile: policies.profiles.RELEASE,
    });
    expect(gates.find((gate) => gate.id === 'securityCritical')?.status).toBe('NOT_EVALUATED');
  });

  it('escalates the visual regression gate to blocking under the RELEASE profile override', () => {
    const releaseVisualGate = evaluateQualityGates({
      metrics: buildQualityMetrics({ results: [], traceabilityEntries: [] }),
      results: [],
      findings: [],
      gates: policies.gates,
      profile: policies.profiles.RELEASE,
    }).find((gate) => gate.id === 'visualRegressionFailures');

    expect(releaseVisualGate?.blocking).toBe(true);
  });

  it('never evaluates performance regression without a configured baseline', () => {
    const gate = evaluateQualityGates({
      metrics: buildQualityMetrics({ results: [], traceabilityEntries: [] }),
      results: [],
      findings: [],
      performanceMaxRegressionRatio: undefined,
      gates: policies.gates,
      profile: policies.profiles.RELEASE,
    }).find((gate) => gate.id === 'performanceRegression');

    expect(gate?.status).toBe('NOT_EVALUATED');
  });

  it('fails the compatibility gate when a mandatory profile executed but its critical path failed', () => {
    const results = [
      result({
        criticalPath: true,
        status: QualityStatus.Failed,
        environment: { compatibilityProfile: 'android-min-supported' },
      }),
    ];
    const gate = evaluateQualityGates({
      metrics: buildQualityMetrics({ results, traceabilityEntries: [] }),
      results,
      findings: [],
      gates: policies.gates,
      profile: policies.profiles.RELEASE,
    }).find((gate) => gate.id === 'compatibilityMandatoryProfiles');

    expect(gate?.status).toBe('FAIL');
  });
});
