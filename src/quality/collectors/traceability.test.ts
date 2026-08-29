import { describe, expect, it } from 'vitest';

import { QualityCategory } from '../types/result';

import {
  buildSpecIndex,
  categoryForSpecFile,
  loadTraceabilityMatrix,
  parseTraceabilityMatrix,
} from './traceability';

const SAMPLE_MARKDOWN = `# Test Case Traceability Matrix

| ID           | Spec file                                     | Feature    | Risk | Suite(s)         | Priority |
| ------------ | ---------------------------------------------- | ---------- | ---- | ----------------- | -------- |
| MOB-SMK-001  | tests/smoke/applicationLaunch.spec.ts          | Launch     | P0   | smoke, critical   | P0       |
| MOB-ACC-001  | tests/accessibility/catalogAccessibility.spec.ts | Accessibility | P2 | accessibility     | P2       |

Trailing notes are ignored.
`;

describe('parseTraceabilityMatrix', () => {
  it('parses rows into typed entries with derived category and critical-path flag', () => {
    const entries = parseTraceabilityMatrix(SAMPLE_MARKDOWN);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      id: 'MOB-SMK-001',
      specFile: 'tests/smoke/applicationLaunch.spec.ts',
      priority: 'P0',
      criticalPath: true,
      category: QualityCategory.Functional,
    });
    expect(entries[1]).toMatchObject({
      id: 'MOB-ACC-001',
      priority: 'P2',
      criticalPath: false,
      category: QualityCategory.Accessibility,
    });
  });

  it('rejects a row with an invalid priority', () => {
    const invalid = SAMPLE_MARKDOWN.replace(
      'P0   | smoke, critical   | P0',
      'P0   | smoke, critical   | P9',
    );
    expect(() => parseTraceabilityMatrix(invalid)).toThrow(/invalid priority/);
  });

  it('rejects a spec file with no known category mapping', () => {
    const invalid = SAMPLE_MARKDOWN.replace(
      'tests/smoke/applicationLaunch.spec.ts',
      'tests/unknown/thing.spec.ts',
    );
    expect(() => parseTraceabilityMatrix(invalid)).toThrow(/no known category mapping/);
  });
});

describe('categoryForSpecFile', () => {
  it('maps known test directories to their quality category', () => {
    expect(categoryForSpecFile('./tests/functional/cart/cartBasics.spec.ts')).toBe(
      QualityCategory.Functional,
    );
    expect(categoryForSpecFile('tests/mobile-web/sauceDemoBrowsing.spec.ts')).toBe(
      QualityCategory.MobileWeb,
    );
  });

  it('returns undefined for an unrecognized directory', () => {
    expect(categoryForSpecFile('tests/unknown/thing.spec.ts')).toBeUndefined();
  });
});

describe('loadTraceabilityMatrix (real repository file)', () => {
  it('parses the real docs/traceability-matrix.md without error', () => {
    const entries = loadTraceabilityMatrix(process.cwd());

    expect(entries.length).toBeGreaterThan(30);
    const index = buildSpecIndex(entries);
    expect(index.get('tests/smoke/applicationLaunch.spec.ts')).toMatchObject({
      id: 'MOB-SMK-001',
      priority: 'P0',
    });
  });
});
