export interface AccessibleElementSnapshot {
  className: string;
  text: string;
  contentDescription: string;
  clickable: boolean;
  enabled: boolean;
  displayed: boolean;
  width: number;
  height: number;
}

export type AccessibilityCheckId =
  | 'missing-accessible-label'
  | 'duplicated-accessible-label'
  | 'touch-target-too-small'
  | 'disabled-interactive-element';

export interface AccessibilityIssue {
  checkId: AccessibilityCheckId;
  elementDescription: string;
  detail: string;
}

export interface AccessibilityAuditResult {
  screenName: string;
  elementsScanned: number;
  issues: AccessibilityIssue[];
}
