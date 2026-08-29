import { createHash } from 'node:crypto';
import fs from 'node:fs';

export interface IntegrityEntry {
  path: string;
  sha256: string;
  sizeBytes: number;
}

export function hashFile(filePath: string): IntegrityEntry | undefined {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  const contents = fs.readFileSync(filePath);
  return {
    path: filePath,
    sha256: createHash('sha256').update(contents).digest('hex'),
    sizeBytes: contents.byteLength,
  };
}

export function buildIntegrityManifest(filePaths: string[]): IntegrityEntry[] {
  return filePaths
    .map((filePath) => hashFile(filePath))
    .filter((entry): entry is IntegrityEntry => entry !== undefined);
}
