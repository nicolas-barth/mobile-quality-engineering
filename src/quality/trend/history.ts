import fs from 'node:fs';
import path from 'node:path';

import { QualitySnapshot } from '../types/trend';
import { QualityEngineError } from '../validation/errors';
import { resolveWithinRoot } from '../validation/safePath';

const HISTORY_DIR = 'quality-history';

function historyDir(root: string): string {
  return resolveWithinRoot(root, HISTORY_DIR);
}

export function loadLatestQualitySnapshot(
  root: string = process.cwd(),
): QualitySnapshot | undefined {
  const latestPath = path.join(historyDir(root), 'latest.json');
  if (!fs.existsSync(latestPath)) {
    return undefined;
  }
  try {
    return JSON.parse(fs.readFileSync(latestPath, 'utf-8')) as QualitySnapshot;
  } catch (error) {
    throw new QualityEngineError('Could not parse quality-history/latest.json', error);
  }
}

export function saveQualitySnapshot(
  snapshot: QualitySnapshot,
  root: string = process.cwd(),
): string {
  const dir = historyDir(root);
  fs.mkdirSync(dir, { recursive: true });

  const versionLabel = snapshot.appVersion ?? snapshot.releaseId;
  const versionedPath = path.join(dir, `${versionLabel}.json`);
  const serialized = JSON.stringify(snapshot, null, 2);

  fs.writeFileSync(versionedPath, serialized);
  fs.writeFileSync(path.join(dir, 'latest.json'), serialized);

  return versionedPath;
}
