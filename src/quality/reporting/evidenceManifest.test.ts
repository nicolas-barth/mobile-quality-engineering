import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildEvidenceManifest } from './evidenceManifest';

describe('buildEvidenceManifest', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-manifest-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('marks every candidate artifact as absent when nothing has been generated', () => {
    const manifest = buildEvidenceManifest(root, '2026-08-15T10:00:00.000Z');
    expect(manifest.entries.every((entry) => !entry.exists)).toBe(true);
  });

  it('marks an artifact present once it exists on disk, referencing its path rather than copying content', () => {
    fs.mkdirSync(path.join(root, 'reports', 'security'), { recursive: true });
    fs.writeFileSync(path.join(root, 'reports', 'security', 'summary.json'), '{}');

    const manifest = buildEvidenceManifest(root, '2026-08-15T10:00:00.000Z');
    const security = manifest.entries.find((entry) => entry.category === 'SECURITY');
    expect(security?.exists).toBe(true);
    expect(security?.path).toBe('reports/security/summary.json');
  });
});
