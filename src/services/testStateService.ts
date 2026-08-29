import { ResetTier } from '../types/testExecution';

const APPLICATION_RESET_PATH_SEGMENTS = ['/device/lifecycle', '/device/appState'];
const CLEAN_RESET_PATH_SEGMENTS = ['/installation', '/upgrade'];

export function determineResetTier(specFilePath: string): ResetTier {
  const normalizedPath = specFilePath.replace(/\\/g, '/');

  if (CLEAN_RESET_PATH_SEGMENTS.some((segment) => normalizedPath.includes(segment))) {
    return 'clean';
  }

  if (APPLICATION_RESET_PATH_SEGMENTS.some((segment) => normalizedPath.includes(segment))) {
    return 'application';
  }

  return 'lightweight';
}
