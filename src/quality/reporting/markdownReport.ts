import { RELEASE_DECISION_LABEL, ReleaseAssessment } from '../types/decision';
import { TrendReport } from '../types/trend';

import { EvidenceManifest } from './evidenceManifest';

export const KNOWN_LIMITATIONS: string[] = [
  'retryRecoveryRate is always reported as null: no collector currently records per-test retry attempts, only the final WDIO outcome.',
  'Per-test flaky/broken/blocked health is not tracked across releases yet; flakiness today comes from the single-execution stability-repeat mechanism built in Stage 3. Cross-release per-test history can be added once multiple real release snapshots exist in quality-history/.',
  'Manifest analysis is heuristic (UTF-16LE string-pool extraction), not an authoritative aapt/apkanalyzer dump, so exported/debuggable attributes are not available to the security gates.',
  'This environment has no Android SDK, emulator, or physical device, so most WDIO-backed evidence (functional, device, accessibility, visual, installation, upgrade, compatibility, stability) is NOT_EXECUTED here; only the static security scan and unit tests produce REAL evidence in this environment.',
];

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function renderHeader(assessment: ReleaseAssessment): string {
  return [
    '# Release Readiness Report',
    '',
    `- **Release**: ${assessment.releaseId}`,
    `- **Application version**: ${assessment.appVersion ?? 'unknown'}`,
    `- **Commit**: ${assessment.commitSha ?? 'unknown'}`,
    `- **Branch**: ${assessment.branch ?? 'unknown'}`,
    `- **Environment**: ${assessment.environment}`,
    `- **Policy profile**: ${assessment.policyProfile}`,
    `- **Data mode**: ${assessment.dataMode}`,
    `- **Generated at**: ${assessment.generatedAt}`,
    '',
  ].join('\n');
}

function renderDecision(assessment: ReleaseAssessment): string {
  return [
    '## Decision',
    '',
    `- **Decision**: ${RELEASE_DECISION_LABEL[assessment.decision]}`,
    `- **Score**: ${assessment.score}/100 (minimum for ${assessment.policyProfile}: ${assessment.minimumScore})`,
    `- **Confidence**: ${assessment.confidence}`,
    `- **Residual risk**: ${assessment.risk.level}`,
    '',
  ].join('\n');
}

function renderExecutiveSummary(assessment: ReleaseAssessment): string {
  const lines = [
    '## Executive Summary',
    '',
    `This release is assessed as **${RELEASE_DECISION_LABEL[assessment.decision]}** with a readiness score of ${assessment.score}/100 and ${assessment.confidence} confidence, based on ${assessment.metrics.execution.total} normalized quality results (${assessment.metrics.execution.executionRate >= 1 ? 'all' : formatPercent(assessment.metrics.execution.executionRate)} of which were executed).`,
  ];

  if (assessment.blockers.length > 0) {
    lines.push(`${assessment.blockers.length} blocking issue(s) prevent GO.`);
  } else if (assessment.warnings.length > 0) {
    lines.push(
      `No blocking issues were found, but ${assessment.warnings.length} warning(s) keep this release conditional.`,
    );
  } else {
    lines.push('No blocking issues or warnings were found.');
  }
  lines.push('');
  return lines.join('\n');
}

function renderIssueList(title: string, issues: ReleaseAssessment['blockers']): string {
  const lines = [`## ${title}`, ''];
  if (issues.length === 0) {
    lines.push('None.');
  } else {
    for (const issue of issues) {
      lines.push(`- **[${issue.category}]** ${issue.message}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

function renderGates(assessment: ReleaseAssessment): string {
  const lines = [
    '## Quality Gates',
    '',
    '| Gate | Category | Status | Expected | Actual | Blocking |',
    '| --- | --- | --- | --- | --- | --- |',
  ];
  for (const gate of assessment.gates) {
    lines.push(
      `| ${gate.name} | ${gate.category} | ${gate.status} | ${gate.expected} | ${gate.actual} | ${gate.blocking ? 'yes' : 'no'} |`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

function renderScorecard(assessment: ReleaseAssessment): string {
  const lines = [
    '## Quality Scorecard',
    '',
    '| Dimension | Score | Status | Evidence |',
    '| --- | ---: | --- | --- |',
  ];
  for (const dimension of assessment.dimensions) {
    const status =
      dimension.evidenceStatus === 'UNAVAILABLE'
        ? 'NO EVIDENCE'
        : dimension.score >= dimension.maxScore * 0.95
          ? 'PASS'
          : dimension.score >= dimension.maxScore * 0.7
            ? 'WARNING'
            : 'FAIL';
    lines.push(
      `| ${dimension.category} | ${dimension.score}/${dimension.maxScore} | ${status} | ${dimension.reason} |`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

function renderCoverage(assessment: ReleaseAssessment): string {
  const coverage = assessment.metrics.coverage;
  return [
    '## Execution Coverage',
    '',
    `- **Implemented** (automated specs in the traceability matrix): ${coverage.implemented}`,
    `- **Executed**: ${coverage.executed} (${formatPercent(coverage.executedCoverageRate)} of implemented)`,
    `- **Blocked**: ${coverage.blocked}`,
    `- **Manual-only**: ${coverage.manualOnly}`,
    '',
  ].join('\n');
}

function renderFailureDistribution(assessment: ReleaseAssessment): string {
  const lines = [
    '## Failure Distribution',
    '',
    '| Failure Category | Count | Percentage |',
    '| --- | ---: | ---: |',
  ];
  for (const [category, entry] of Object.entries(assessment.metrics.failureDistribution)) {
    lines.push(`| ${category} | ${entry.count} | ${formatPercent(entry.percentage)} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function renderEvidenceAvailability(manifest: EvidenceManifest): string {
  const lines = [
    '## Evidence Availability',
    '',
    '| Artifact | Path | Available |',
    '| --- | --- | --- |',
  ];
  for (const entry of manifest.entries) {
    lines.push(`| ${entry.description} | \`${entry.path}\` | ${entry.exists ? 'yes' : 'no'} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function renderTrend(trend: TrendReport): string {
  const lines = ['## Trend', ''];
  if (!trend.comparable) {
    lines.push('No comparable previous release snapshot exists in `quality-history/` yet.');
    lines.push('');
    return lines.join('\n');
  }

  lines.push(
    `Compared against release \`${trend.previousReleaseId ?? 'unknown'}\` (${trend.previousAppVersion ?? 'unknown version'}).`,
    '',
  );
  lines.push('| Metric | Previous | Current | Classification |', '| --- | ---: | ---: | --- |');
  for (const comparison of trend.comparisons) {
    lines.push(
      `| ${comparison.metric} | ${comparison.previous ?? 'n/a'} | ${comparison.current ?? 'n/a'} | ${comparison.classification} |`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

function renderKnownLimitations(): string {
  return [
    '## Known Limitations',
    '',
    ...KNOWN_LIMITATIONS.map((limitation) => `- ${limitation}`),
    '',
  ].join('\n');
}

function renderConditionsAndRecommendations(assessment: ReleaseAssessment): string {
  const lines = ['## Release Conditions', ''];
  if (assessment.conditions.length === 0) {
    lines.push('None.');
  } else {
    assessment.conditions.forEach((condition, index) => lines.push(`${index + 1}. ${condition}`));
  }
  lines.push('', '## Recommendation', '');
  if (assessment.recommendations.length === 0) {
    lines.push('No additional recommendations.');
  } else {
    for (const recommendation of assessment.recommendations) {
      lines.push(`- ${recommendation}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

export function buildReleaseReportMarkdown(
  assessment: ReleaseAssessment,
  trend: TrendReport,
  evidenceManifest: EvidenceManifest,
): string {
  return [
    renderHeader(assessment),
    renderDecision(assessment),
    renderExecutiveSummary(assessment),
    renderIssueList('Blocking Gates', assessment.blockers),
    renderIssueList('Warnings', assessment.warnings),
    renderScorecard(assessment),
    renderGates(assessment),
    renderCoverage(assessment),
    renderFailureDistribution(assessment),
    renderEvidenceAvailability(evidenceManifest),
    renderTrend(trend),
    `## Residual Risk (${assessment.risk.level})\n\n${
      assessment.risk.contributors.length === 0
        ? 'No residual risk contributors were identified.'
        : assessment.risk.contributors
            .map((contributor) => `- **[${contributor.level}]** ${contributor.description}`)
            .join('\n')
    }\n`,
    renderKnownLimitations(),
    renderConditionsAndRecommendations(assessment),
  ].join('\n');
}
