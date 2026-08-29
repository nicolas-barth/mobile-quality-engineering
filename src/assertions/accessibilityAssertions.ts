import { AccessibilityAuditResult } from '../types/accessibility';

export function expectNoAccessibilityIssues(result: AccessibilityAuditResult): void {
  if (result.issues.length > 0) {
    const summary = result.issues
      .map((issue) => `[${issue.checkId}] ${issue.elementDescription} - ${issue.detail}`)
      .join('; ');
    throw new Error(
      `Expected no automated accessibility issues on "${result.screenName}" (${result.elementsScanned} elements scanned) but found ${result.issues.length}: ${summary}`,
    );
  }
}
