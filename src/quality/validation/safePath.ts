import path from 'node:path';

import { QualityEngineError } from './errors';

export function resolveWithinRoot(root: string, candidate: string): string {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(resolvedRoot, candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new QualityEngineError(
      `Refusing to read path outside of "${resolvedRoot}": "${candidate}"`,
    );
  }

  return resolvedCandidate;
}
