import { $$ } from '@wdio/globals';

import { auditAccessibility } from '../services/accessibilityAuditService';
import { AccessibilityAuditResult, AccessibleElementSnapshot } from '../types/accessibility';

import { getDisplayDensity } from './deviceConfig';

const BASELINE_DENSITY_DPI = 160;
const DEFAULT_PIXELS_PER_DP = 2;
const CLICKABLE_ELEMENTS_SELECTOR = 'android=new UiSelector().clickable(true)';

async function collectClickableElements(): Promise<AccessibleElementSnapshot[]> {
  const elements = await $$(CLICKABLE_ELEMENTS_SELECTOR).getElements();

  return elements.map(async (element) => {
    const [text, contentDescription, enabled, displayed, size, className] = await Promise.all([
      element.getText(),
      element.getAttribute('content-desc'),
      element.isEnabled(),
      element.isDisplayed(),
      element.getSize(),
      element.getAttribute('className'),
    ]);

    return {
      className: className || 'unknown',
      text: text || '',
      contentDescription: contentDescription || '',
      clickable: true,
      enabled,
      displayed,
      width: size.width,
      height: size.height,
    };
  });
}

export async function resolvePixelsPerDp(): Promise<number> {
  const output = await getDisplayDensity();
  const match = /(\d+)/.exec(output);
  if (!match?.[1]) {
    return DEFAULT_PIXELS_PER_DP;
  }
  return Number.parseInt(match[1], 10) / BASELINE_DENSITY_DPI;
}

export async function auditScreenAccessibility(
  screenName: string,
): Promise<AccessibilityAuditResult> {
  const [elements, pixelsPerDp] = await Promise.all([
    collectClickableElements(),
    resolvePixelsPerDp(),
  ]);

  return auditAccessibility(screenName, elements, pixelsPerDp);
}
