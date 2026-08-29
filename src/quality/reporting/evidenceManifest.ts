import fs from 'node:fs';

import { QUALITY_SCHEMA_VERSION } from '../types/decision';
import { resolveWithinRoot } from '../validation/safePath';

export interface EvidenceManifestEntry {
  category: string;
  description: string;
  path: string;
  exists: boolean;
}

export interface EvidenceManifest {
  schemaVersion: string;
  generatedAt: string;
  entries: EvidenceManifestEntry[];
}

const CANDIDATES: Array<Omit<EvidenceManifestEntry, 'exists'>> = [
  { category: 'JUNIT', description: 'JUnit XML test results', path: 'test-results' },
  { category: 'ALLURE_RESULTS', description: 'Raw Allure result files', path: 'allure-results' },
  {
    category: 'ALLURE_REPORT',
    description: 'Generated Allure HTML report',
    path: 'reports/allure-report',
  },
  {
    category: 'EVIDENCE',
    description: 'Failure evidence bundles (screenshot, page source, device info, logcat, error)',
    path: 'evidence',
  },
  {
    category: 'SECURITY',
    description: 'Security scan summary (APK, manifest, secrets, dependencies)',
    path: 'reports/security/summary.json',
  },
  {
    category: 'STABILITY_SUMMARY',
    description: 'Stability-repeat flakiness summary',
    path: 'reports/stability/summary.json',
  },
  {
    category: 'STABILITY_MONKEY',
    description: 'Monkey crash/ANR run result',
    path: 'reports/stability/monkey.json',
  },
  {
    category: 'PERFORMANCE',
    description: 'Functional timing results',
    path: 'reports/performance/functional-timings.json',
  },
  {
    category: 'VISUAL',
    description: 'Visual regression screenshots and diffs',
    path: 'reports/visual',
  },
  {
    category: 'MANUAL_EVIDENCE',
    description: 'Manual (non-automated) evidence assessments',
    path: 'reports/manual/manual-evidence.json',
  },
];

export function buildEvidenceManifest(root: string, generatedAt: string): EvidenceManifest {
  const entries = CANDIDATES.map((candidate) => ({
    ...candidate,
    exists: fs.existsSync(resolveWithinRoot(root, candidate.path)),
  }));

  return { schemaVersion: QUALITY_SCHEMA_VERSION, generatedAt, entries };
}
