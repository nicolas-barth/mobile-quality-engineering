import fs from 'node:fs';
import path from 'node:path';

import { QualityCategory, TestPriority } from '../types/result';
import { QualityEngineError } from '../validation/errors';

export interface TraceabilityEntry {
  id: string;
  specFile: string;
  feature: string;
  risk: string;
  suites: string[];
  priority: TestPriority;
  criticalPath: boolean;
  category: QualityCategory;
}

const DIRECTORY_CATEGORY: Record<string, QualityCategory> = {
  smoke: QualityCategory.Functional,
  functional: QualityCategory.Functional,
  device: QualityCategory.DeviceBehavior,
  accessibility: QualityCategory.Accessibility,
  visual: QualityCategory.Visual,
  installation: QualityCategory.Installation,
  upgrade: QualityCategory.Upgrade,
  compatibility: QualityCategory.Compatibility,
  stability: QualityCategory.Stability,
  performance: QualityCategory.Performance,
  'mobile-web': QualityCategory.MobileWeb,
  security: QualityCategory.Security,
};

const VALID_PRIORITIES = new Set<TestPriority>(['P0', 'P1', 'P2', 'P3']);

export function normalizeSpecPath(specFile: string): string {
  return specFile.replace(/^\.\//, '').replace(/\\/g, '/');
}

export function categoryForSpecFile(specFile: string): QualityCategory | undefined {
  const normalized = normalizeSpecPath(specFile);
  const match = /^tests\/([^/]+)\//.exec(normalized);
  const directory = match?.[1];
  return directory !== undefined ? DIRECTORY_CATEGORY[directory] : undefined;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

export function parseTraceabilityMatrix(markdown: string): TraceabilityEntry[] {
  const lines = markdown.split('\n');
  const headerIndex = lines.findIndex((line) => /^\|\s*ID\s*\|/.test(line));
  if (headerIndex === -1) {
    throw new QualityEngineError('Traceability matrix markdown table header not found');
  }

  const entries: TraceabilityEntry[] = [];
  for (let index = headerIndex + 2; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined || !line.trim().startsWith('|')) {
      break;
    }

    const cells = splitTableRow(line);
    const [id, specFile, feature, risk, suiteList, priorityCell] = cells;
    if (id === undefined || specFile === undefined || priorityCell === undefined) {
      continue;
    }

    const priority = priorityCell.trim();
    if (!VALID_PRIORITIES.has(priority as TestPriority)) {
      throw new QualityEngineError(
        `Traceability matrix row "${id}" has an invalid priority: "${priority}"`,
      );
    }

    const suites = (suiteList ?? '')
      .split(',')
      .map((suite) => suite.trim())
      .filter((suite) => suite.length > 0);

    const category = categoryForSpecFile(specFile);
    if (category === undefined) {
      throw new QualityEngineError(
        `Traceability matrix row "${id}" references a spec file with no known category mapping: "${specFile}"`,
      );
    }

    entries.push({
      id,
      specFile: normalizeSpecPath(specFile),
      feature: feature ?? '',
      risk: risk ?? '',
      suites,
      priority: priority as TestPriority,
      criticalPath: suites.includes('critical'),
      category,
    });
  }

  return entries;
}

export function loadTraceabilityMatrix(root: string = process.cwd()): TraceabilityEntry[] {
  const matrixPath = path.join(root, 'docs', 'traceability-matrix.md');
  if (!fs.existsSync(matrixPath)) {
    return [];
  }
  return parseTraceabilityMatrix(fs.readFileSync(matrixPath, 'utf-8'));
}

export function buildSpecIndex(entries: TraceabilityEntry[]): Map<string, TraceabilityEntry> {
  const index = new Map<string, TraceabilityEntry>();
  for (const entry of entries) {
    index.set(entry.specFile, entry);
  }
  return index;
}
