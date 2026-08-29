import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { collectQualityEvidence } from '.';

const NORMAL_SUITE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="1" failures="0" errors="0" skipped="0">
  <testsuite name="Application launch" tests="1" failures="0" errors="0" skipped="0">
    <properties>
      <property name="file" value="./tests/smoke/applicationLaunch.spec.ts"/>
    </properties>
    <testcase classname="Application_launch" name="launches and shows the catalog" time="0.5"></testcase>
  </testsuite>
</testsuites>`;

describe('collectQualityEvidence', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-collect-'));
    fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('produces a REAL-mode execution with a flat scan when no per-profile directories exist', () => {
    fs.writeFileSync(path.join(root, 'test-results', 'results-0-0.xml'), NORMAL_SUITE_XML);

    const { execution, raw } = collectQualityEvidence({
      root,
      env: {},
    });

    expect(execution.dataMode).toBe('REAL');
    expect(execution.results).toHaveLength(1);
    expect(execution.results[0]?.environment?.compatibilityProfile).toBeUndefined();
    expect(raw.findings).toEqual([]);
    expect(raw.traceabilityEntries).toEqual([]);
  });

  it('tags results with their compatibility profile when per-profile subdirectories exist', () => {
    fs.mkdirSync(path.join(root, 'test-results', 'android-min-supported'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'test-results', 'android-min-supported', 'results-0-0.xml'),
      NORMAL_SUITE_XML,
    );

    const { execution } = collectQualityEvidence({ root, env: {} });

    expect(execution.results).toHaveLength(1);
    expect(execution.results[0]?.environment?.compatibilityProfile).toBe('android-min-supported');
  });

  it('reads the app version from app/android/VERSION.txt when present', () => {
    fs.mkdirSync(path.join(root, 'app', 'android'), { recursive: true });
    fs.writeFileSync(path.join(root, 'app', 'android', 'VERSION.txt'), 'version=2.2.0\nbuild=25\n');

    const { execution } = collectQualityEvidence({ root, env: {} });

    expect(execution.appVersion).toBe('2.2.0');
  });
});
