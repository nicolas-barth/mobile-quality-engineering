import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

import { ManifestAnalysisResult } from '../types/apk';

const execFile = promisify(execFileCallback);

const PERMISSION_PATTERN = /android(?:\.[a-zA-Z0-9_]+)*\.permission\.[A-Z_]+/g;
const QUALIFIED_CLASS_PATTERN = /(?:com|org|net|io|androidx|android)(?:\.[a-zA-Z0-9_]+){2,}/g;

function classifyComponent(
  qualifiedClass: string,
): 'activity' | 'service' | 'provider' | 'receiver' | null {
  const lower = qualifiedClass.toLowerCase();
  if (lower.includes('activity')) {
    return 'activity';
  }
  if (lower.includes('service')) {
    return 'service';
  }
  if (lower.includes('provider')) {
    return 'provider';
  }
  if (lower.includes('receiver')) {
    return 'receiver';
  }
  return null;
}

function selectPackageName(candidates: string[], components: string[]): string | null {
  let best: string | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = components.filter((component) => component.startsWith(`${candidate}.`)).length;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

export function extractPrintableText(manifestBytes: Buffer): string {
  return manifestBytes.toString('utf16le');
}

export function parseManifestText(text: string): ManifestAnalysisResult {
  const permissions = [...new Set(text.match(PERMISSION_PATTERN) ?? [])];
  const permissionSet = new Set(permissions);
  const qualifiedClasses = (text.match(QUALIFIED_CLASS_PATTERN) ?? []).filter(
    (candidate) => !permissionSet.has(candidate),
  );
  const uniqueQualifiedClasses = [...new Set(qualifiedClasses)];

  const activities: string[] = [];
  const services: string[] = [];
  const providers: string[] = [];
  const receivers: string[] = [];
  const packageNameCandidates: string[] = [];

  for (const qualifiedClass of uniqueQualifiedClasses) {
    const componentKind = classifyComponent(qualifiedClass);
    if (componentKind === 'activity') {
      activities.push(qualifiedClass);
    } else if (componentKind === 'service') {
      services.push(qualifiedClass);
    } else if (componentKind === 'provider') {
      providers.push(qualifiedClass);
    } else if (componentKind === 'receiver') {
      receivers.push(qualifiedClass);
    } else {
      packageNameCandidates.push(qualifiedClass);
    }
  }

  return {
    method: 'heuristic-string-scan',
    packageName: selectPackageName(packageNameCandidates, [
      ...activities,
      ...services,
      ...providers,
      ...receivers,
    ]),
    permissions: permissions.sort(),
    activities: activities.sort(),
    services: services.sort(),
    providers: providers.sort(),
    receivers: receivers.sort(),
  };
}

export async function analyzeManifest(apkPath: string): Promise<ManifestAnalysisResult> {
  const { stdout } = await execFile('unzip', ['-p', apkPath, 'AndroidManifest.xml'], {
    encoding: 'buffer',
    maxBuffer: 1024 * 1024 * 10,
  });

  return parseManifestText(extractPrintableText(stdout));
}
