import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FailureCategory } from '../../types/failure';
import { QualityCategory, QualityStatus } from '../types/result';

import { collectJunitResults, parseJunitXml } from './junitCollector';
import { TraceabilityEntry } from './traceability';

const NORMAL_SUITE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="2" failures="1" errors="0" skipped="0">
  <testsuite name="Application launch" tests="2" failures="1" errors="0" skipped="0" timestamp="2026-08-15T10:00:00" time="1.234">
    <properties>
      <property name="specId" value="0"/>
      <property name="suiteName" value="Application launch"/>
      <property name="capabilities" value="android"/>
      <property name="file" value="./tests/smoke/applicationLaunch.spec.ts"/>
    </properties>
    <testcase classname="Application_launch" name="launches and shows the catalog" time="0.842"></testcase>
    <testcase classname="Application_launch" name="restores portrait orientation" time="0.391">
      <failure message="Product catalog was not displayed after application launch: Timeout"/>
    </testcase>
  </testsuite>
</testsuites>`;

const SESSION_FAILURE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="1" failures="1" errors="0" skipped="0">
  <testsuite tests="1" failures="1" errors="0" skipped="0">
    <testcase classname="" name="">
      <failure message="Unable to connect to &quot;http://127.0.0.1:4723/&quot;, make sure browser driver is running on that address.&#xA;It seems like the service failed to start or is rejecting any connections."/>
    </testcase>
  </testsuite>
</testsuites>`;

function buildTraceabilityIndex(): Map<string, TraceabilityEntry> {
  const index = new Map<string, TraceabilityEntry>();
  index.set('tests/smoke/applicationLaunch.spec.ts', {
    id: 'MOB-SMK-001',
    specFile: 'tests/smoke/applicationLaunch.spec.ts',
    feature: 'Application launch',
    risk: 'P0',
    suites: ['smoke', 'critical'],
    priority: 'P0',
    criticalPath: true,
    category: QualityCategory.Functional,
  });
  return index;
}

describe('parseJunitXml', () => {
  it('parses a normal suite into testsuite/testcase records with the file property', () => {
    const suites = parseJunitXml(NORMAL_SUITE_XML);

    expect(suites).toHaveLength(1);
    expect(suites[0]?.file).toBe('./tests/smoke/applicationLaunch.spec.ts');
    expect(suites[0]?.testcases).toHaveLength(2);
    expect(suites[0]?.testcases[0]).toMatchObject({
      name: 'launches and shows the catalog',
      status: QualityStatus.Passed,
    });
    expect(suites[0]?.testcases[1]).toMatchObject({ status: QualityStatus.Failed });
  });

  it('parses a session-establishment failure with no properties block', () => {
    const suites = parseJunitXml(SESSION_FAILURE_XML);

    expect(suites).toHaveLength(1);
    expect(suites[0]?.file).toBeUndefined();
    expect(suites[0]?.testcases[0]?.status).toBe(QualityStatus.Failed);
  });

  it('throws on input that is not JUnit XML', () => {
    expect(() => parseJunitXml('not xml at all')).toThrow(/does not look like/);
  });
});

describe('collectJunitResults', () => {
  let testResultsDir: string;

  beforeEach(() => {
    testResultsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-junit-'));
  });

  afterEach(() => {
    fs.rmSync(testResultsDir, { recursive: true, force: true });
  });

  it('normalizes a passing/failing suite using the traceability index for category and priority', () => {
    fs.writeFileSync(path.join(testResultsDir, 'results-0-0.xml'), NORMAL_SUITE_XML);

    const { results, filesParsed } = collectJunitResults(os.tmpdir(), {
      testResultsDir,
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
      traceabilityBySpec: buildTraceabilityIndex(),
    });

    expect(filesParsed).toBe(1);
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      category: QualityCategory.Functional,
      status: QualityStatus.Passed,
      priority: 'P0',
      criticalPath: true,
      traceId: 'MOB-SMK-001',
    });
    expect(results[1]).toMatchObject({
      status: QualityStatus.Failed,
      failureCategory: FailureCategory.AutomationDefect,
    });
  });

  it('classifies a session-establishment failure with no spec identity as UNKNOWN category and infrastructure failure', () => {
    fs.writeFileSync(path.join(testResultsDir, 'results-0-1.xml'), SESSION_FAILURE_XML);

    const { results } = collectJunitResults(os.tmpdir(), {
      testResultsDir,
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
      traceabilityBySpec: buildTraceabilityIndex(),
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      category: QualityCategory.Unknown,
      status: QualityStatus.Failed,
      failureCategory: FailureCategory.InfrastructureFailure,
    });
  });

  it('returns no results when the test-results directory does not exist', () => {
    const { results, filesParsed } = collectJunitResults(os.tmpdir(), {
      testResultsDir: path.join(testResultsDir, 'does-not-exist'),
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
      traceabilityBySpec: new Map(),
    });

    expect(results).toEqual([]);
    expect(filesParsed).toBe(0);
  });
});
