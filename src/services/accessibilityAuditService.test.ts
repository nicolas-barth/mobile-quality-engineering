import { describe, expect, it } from 'vitest';

import { AccessibleElementSnapshot } from '../types/accessibility';

import { auditAccessibility } from './accessibilityAuditService';

function element(overrides: Partial<AccessibleElementSnapshot> = {}): AccessibleElementSnapshot {
  return {
    className: 'android.widget.Button',
    text: '',
    contentDescription: '',
    clickable: true,
    enabled: true,
    displayed: true,
    width: 200,
    height: 200,
    ...overrides,
  };
}

describe('auditAccessibility', () => {
  it('flags a clickable element with no text and no content description', () => {
    const result = auditAccessibility('Catalog', [element()], 2);
    expect(result.issues.map((issue) => issue.checkId)).toContain('missing-accessible-label');
  });

  it('does not flag a clickable element that exposes a content description', () => {
    const result = auditAccessibility(
      'Catalog',
      [element({ contentDescription: 'Add to cart' })],
      2,
    );
    expect(result.issues).toEqual([]);
  });

  it('flags accessible labels shared by more than one clickable element', () => {
    const elements = [
      element({ contentDescription: 'Add to cart' }),
      element({ contentDescription: 'Add to cart' }),
    ];
    const result = auditAccessibility('Catalog', elements, 2);
    expect(result.issues.map((issue) => issue.checkId)).toContain('duplicated-accessible-label');
  });

  it('flags a touch target below the 48dp minimum once density is applied', () => {
    const smallElement = element({ contentDescription: 'Close', width: 60, height: 60 });
    const result = auditAccessibility('Cart', [smallElement], 2);
    expect(result.issues.map((issue) => issue.checkId)).toContain('touch-target-too-small');
  });

  it('does not flag a touch target that meets the 48dp minimum once density is applied', () => {
    const adequateElement = element({ contentDescription: 'Close', width: 100, height: 100 });
    const result = auditAccessibility('Cart', [adequateElement], 2);
    expect(result.issues.map((issue) => issue.checkId)).not.toContain('touch-target-too-small');
  });

  it('flags a disabled element that is still clickable and visible', () => {
    const disabledElement = element({ contentDescription: 'Checkout', enabled: false });
    const result = auditAccessibility('Cart', [disabledElement], 2);
    expect(result.issues.map((issue) => issue.checkId)).toContain('disabled-interactive-element');
  });

  it('ignores non-clickable elements entirely', () => {
    const label = element({ clickable: false, text: '' });
    const result = auditAccessibility('Catalog', [label], 2);
    expect(result.issues).toEqual([]);
    expect(result.elementsScanned).toBe(1);
  });
});
