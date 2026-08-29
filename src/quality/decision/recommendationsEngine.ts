import { QualityGateResult } from '../types/gate';

export function generateRecommendations(gates: QualityGateResult[]): string[] {
  const recommendations: string[] = [];
  const gateById = new Map(gates.map((gate) => [gate.id, gate]));

  if (gateById.get('flakyRate')?.status === 'FAIL') {
    recommendations.push(
      'Investigate the flaky tests surfaced by the stability-repeat run before the next release.',
    );
  }
  if (
    ['FAIL', 'NOT_EVALUATED'].includes(gateById.get('compatibilityMandatoryProfiles')?.status ?? '')
  ) {
    recommendations.push('Execute the missing mandatory compatibility profiles.');
  }
  if (gateById.get('securityHighProduct')?.status === 'FAIL') {
    recommendations.push('Review the HIGH-severity product security finding(s) before release.');
  }
  if (gateById.get('securityHighDependency')?.status === 'FAIL') {
    recommendations.push(
      'Upgrade or mitigate the HIGH-severity dependency vulnerabilities reported by npm audit.',
    );
  }
  if (gateById.get('performanceRegression')?.status === 'NOT_EVALUATED') {
    recommendations.push(
      'Establish a trusted performance baseline before enforcing the performance regression gate.',
    );
  }
  if (gateById.get('accessibilityCritical')?.status === 'FAIL') {
    recommendations.push('Fix the confirmed accessibility defect(s) before release.');
  }
  if (gateById.get('visualRegressionFailures')?.status === 'FAIL') {
    recommendations.push('Review and approve or fix the unapproved visual regression(s).');
  }
  if (
    gateById.get('crashCount')?.status === 'FAIL' ||
    gateById.get('anrCount')?.status === 'FAIL'
  ) {
    recommendations.push(
      'Triage the Monkey-detected crash/ANR before release; this is release-blocking.',
    );
  }

  return recommendations;
}
