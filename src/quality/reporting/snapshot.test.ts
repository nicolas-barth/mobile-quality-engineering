import { describe, expect, it } from 'vitest';

import { FindingSeverity } from '../../types/finding';

import { countSecurityFindingsBySeverity } from './snapshot';

describe('countSecurityFindingsBySeverity', () => {
  it('excludes findings marked not-a-defect from the counts', () => {
    const counts = countSecurityFindingsBySeverity([
      {
        id: '1',
        category: 'security',
        severity: FindingSeverity.Critical,
        title: 'x',
        description: 'x',
        status: 'not-a-defect',
      },
      {
        id: '2',
        category: 'security',
        severity: FindingSeverity.High,
        title: 'x',
        description: 'x',
        status: 'open',
      },
      {
        id: '3',
        category: 'security',
        severity: FindingSeverity.High,
        title: 'x',
        description: 'x',
        status: 'confirmed',
      },
    ]);

    expect(counts).toEqual({ critical: 0, high: 2 });
  });
});
