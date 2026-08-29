import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildIntegrityManifest, hashFile } from './integrity';

describe('integrity hashing', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'quality-integrity-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('computes a matching sha256 digest for a real file', () => {
    const filePath = path.join(root, 'a.json');
    fs.writeFileSync(filePath, '{"a":1}');

    const expected = createHash('sha256').update('{"a":1}').digest('hex');
    expect(hashFile(filePath)).toEqual({ path: filePath, sha256: expected, sizeBytes: 7 });
  });

  it('returns undefined for a file that does not exist', () => {
    expect(hashFile(path.join(root, 'missing.json'))).toBeUndefined();
  });

  it('silently skips missing files when building a manifest rather than throwing', () => {
    const filePath = path.join(root, 'a.json');
    fs.writeFileSync(filePath, 'x');

    const manifest = buildIntegrityManifest([filePath, path.join(root, 'missing.json')]);
    expect(manifest).toHaveLength(1);
  });
});
