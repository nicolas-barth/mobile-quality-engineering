import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { QualityCategory, QualityStatus } from '../types/result';

import { collectManualEvidenceResults } from './manualEvidenceCollector';

describe('collectManualEvidenceResults', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-manual-'));
    fs.mkdirSync(path.join(root, 'reports', 'manual'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('returns an empty array when no manual evidence file exists', () => {
    expect(
      collectManualEvidenceResults(root, {
        executionId: 'exec-1',
        timestamp: '2026-08-15T10:00:00.000Z',
      }),
    ).toEqual([]);
  });

  it('maps manual assessments to categories by reference keyword and never fabricates a pass for NOT_EXECUTED', () => {
    fs.writeFileSync(
      path.join(root, 'reports', 'manual', 'manual-evidence.json'),
      JSON.stringify({
        generatedAt: '2026-08-15T09:00:00.000Z',
        assessments: [
          {
            id: 'MANUAL-TALKBACK',
            title: 'TalkBack checklist',
            reference: 'manual-tests/accessibility/talkback-checklist.md',
            status: 'NOT_EXECUTED',
            assessor: '',
            notes: '',
          },
          {
            id: 'MANUAL-EXPLORATORY-CHECKOUT',
            title: 'Checkout interruption charter',
            reference: 'manual-tests/exploratory/checkout-interruption.md',
            status: 'PASSED',
            assessor: 'qa',
            notes: '',
          },
        ],
      }),
    );

    const results = collectManualEvidenceResults(root, {
      executionId: 'exec-1',
      timestamp: '2026-08-15T10:00:00.000Z',
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      category: QualityCategory.Accessibility,
      status: QualityStatus.NotExecuted,
    });
    expect(results[1]).toMatchObject({
      category: QualityCategory.Functional,
      status: QualityStatus.Passed,
    });
  });
});
