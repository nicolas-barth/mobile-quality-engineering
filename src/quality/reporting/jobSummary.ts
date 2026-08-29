import fs from 'node:fs';

import { RELEASE_DECISION_LABEL, ReleaseAssessment } from '../types/decision';

export function buildJobSummaryMarkdown(assessment: ReleaseAssessment): string {
  const reliability = assessment.metrics.reliability;
  const lines = [
    '## Mobile Release Readiness',
    '',
    `**Decision:** ${RELEASE_DECISION_LABEL[assessment.decision]}  `,
    `**Score:** ${assessment.score}/100  `,
    `**Confidence:** ${assessment.confidence}`,
    '',
    '| Metric | Value |',
    '| --- | --- |',
    `| Critical path pass rate | ${(assessment.metrics.criticalPath.passRate * 100).toFixed(1)}% |`,
    `| Functional pass rate | ${assessment.metrics.category.FUNCTIONAL !== undefined ? (assessment.metrics.category.FUNCTIONAL.passRate * 100).toFixed(1) + '%' : 'no evidence'} |`,
    `| Flaky rate | ${reliability.flakyRate === null ? 'no evidence' : (reliability.flakyRate * 100).toFixed(1) + '%'} |`,
    `| Crashes | ${reliability.crashCount} |`,
    `| ANRs | ${reliability.anrCount} |`,
    `| Blocking issues | ${assessment.blockers.length} |`,
    `| Warnings | ${assessment.warnings.length} |`,
    '',
  ];

  if (assessment.blockers.length > 0) {
    lines.push('### Blocking Gates', '');
    for (const blocker of assessment.blockers) {
      lines.push(`- **[${blocker.category}]** ${blocker.message}`);
    }
    lines.push('');
  }

  if (assessment.warnings.length > 0) {
    lines.push('### Warnings', '');
    for (const warning of assessment.warnings) {
      lines.push(`- **[${warning.category}]** ${warning.message}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function writeGithubJobSummary(
  assessment: ReleaseAssessment,
  env: NodeJS.ProcessEnv = process.env,
): void {
  const summaryPath = env.GITHUB_STEP_SUMMARY;
  if (summaryPath === undefined || summaryPath.length === 0) {
    return;
  }
  fs.appendFileSync(summaryPath, buildJobSummaryMarkdown(assessment));
}
