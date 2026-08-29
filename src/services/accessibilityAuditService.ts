import {
  AccessibilityAuditResult,
  AccessibilityIssue,
  AccessibleElementSnapshot,
} from '../types/accessibility';

const MINIMUM_TOUCH_TARGET_DP = 48;

function describeElement(element: AccessibleElementSnapshot): string {
  const label = element.contentDescription || element.text || '(no visible label)';
  return `${element.className} "${label}"`;
}

function findMissingAccessibleLabels(elements: AccessibleElementSnapshot[]): AccessibilityIssue[] {
  return elements
    .filter((element) => element.clickable && !element.text && !element.contentDescription)
    .map((element) => ({
      checkId: 'missing-accessible-label' as const,
      elementDescription: describeElement(element),
      detail:
        'Clickable element exposes neither text nor a content description to assistive technology',
    }));
}

function findDuplicatedAccessibleLabels(
  elements: AccessibleElementSnapshot[],
): AccessibilityIssue[] {
  const labelCounts = new Map<string, number>();
  for (const element of elements) {
    const label = element.contentDescription || element.text;
    if (element.clickable && label) {
      labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
    }
  }

  const duplicated = [...labelCounts.entries()].filter(([, count]) => count > 1);
  return duplicated.map(([label, count]) => ({
    checkId: 'duplicated-accessible-label' as const,
    elementDescription: label,
    detail: `${count} clickable elements share the accessible label "${label}", which TalkBack users cannot disambiguate by sound alone`,
  }));
}

function findTouchTargetsTooSmall(
  elements: AccessibleElementSnapshot[],
  pixelsPerDp: number,
): AccessibilityIssue[] {
  return elements
    .filter((element) => element.clickable && element.displayed)
    .filter((element) => {
      const widthDp = element.width / pixelsPerDp;
      const heightDp = element.height / pixelsPerDp;
      return widthDp < MINIMUM_TOUCH_TARGET_DP || heightDp < MINIMUM_TOUCH_TARGET_DP;
    })
    .map((element) => ({
      checkId: 'touch-target-too-small' as const,
      elementDescription: describeElement(element),
      detail: `Touch target is ${Math.round(element.width / pixelsPerDp)}x${Math.round(
        element.height / pixelsPerDp,
      )}dp, below the ${MINIMUM_TOUCH_TARGET_DP}dp minimum recommended by Android accessibility guidance`,
    }));
}

function findDisabledInteractiveElements(
  elements: AccessibleElementSnapshot[],
): AccessibilityIssue[] {
  return elements
    .filter((element) => element.clickable && element.displayed && !element.enabled)
    .map((element) => ({
      checkId: 'disabled-interactive-element' as const,
      elementDescription: describeElement(element),
      detail:
        'Element is clickable and visible but reports as disabled; confirm this is intentional product state',
    }));
}

export function auditAccessibility(
  screenName: string,
  elements: AccessibleElementSnapshot[],
  pixelsPerDp: number,
): AccessibilityAuditResult {
  return {
    screenName,
    elementsScanned: elements.length,
    issues: [
      ...findMissingAccessibleLabels(elements),
      ...findDuplicatedAccessibleLabels(elements),
      ...findTouchTargetsTooSmall(elements, pixelsPerDp),
      ...findDisabledInteractiveElements(elements),
    ],
  };
}
