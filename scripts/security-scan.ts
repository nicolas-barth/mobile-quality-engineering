import { exec as execCallback } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import { loadEnv } from '../src/config/env';
import { inspectApkPackage } from '../src/services/apkPackageService';
import { analyzeManifest } from '../src/services/manifestAnalysisService';
import { scanForSecrets } from '../src/services/secretScanService';
import { Finding, FindingSeverity } from '../src/types/finding';

const exec = promisify(execCallback);
const RESULTS_PATH = path.join('reports', 'security', 'summary.json');
const SOURCE_DIRECTORIES = ['src', 'tests', 'config', 'scripts'];
const SCANNABLE_EXTENSIONS = new Set(['.ts', '.sh', '.yml', '.yaml']);
const EXPECTED_PERMISSIONS = new Set([
  'android.permission.CAMERA',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.USE_BIOMETRIC',
  'android.permission.USE_FINGERPRINT',
  'android.permission.INTERNET',
  'android.permission.WAKE_LOCK',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
]);

function collectSourceFiles(dir: string, out: string[]): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, out);
      continue;
    }
    if (entry.name.endsWith('.test.ts')) {
      continue;
    }
    if (SCANNABLE_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(fullPath);
    }
  }
}

function buildSecretFindings(): Finding[] {
  const files: string[] = [];
  for (const directory of SOURCE_DIRECTORIES) {
    collectSourceFiles(directory, files);
  }

  const findings: Finding[] = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf-8').split('\n');
    for (const match of scanForSecrets(lines)) {
      findings.push({
        id: `SEC-SECRET-${findings.length + 1}`,
        category: 'security',
        severity: FindingSeverity.High,
        title: `Potential ${match.pattern} found in ${file}`,
        description: `A pattern matching "${match.pattern}" was found: ${match.excerpt}`,
        evidence: file,
        status: 'open',
      });
    }
  }
  return findings;
}

function buildManifestFindings(manifest: Awaited<ReturnType<typeof analyzeManifest>>): Finding[] {
  const findings: Finding[] = [];

  const unexpectedPermissions = manifest.permissions.filter(
    (permission) => !EXPECTED_PERMISSIONS.has(permission),
  );
  for (const permission of unexpectedPermissions) {
    findings.push({
      id: `SEC-PERM-${findings.length + 1}`,
      category: 'security',
      severity: FindingSeverity.Low,
      title: `Unrecognized permission requested: ${permission}`,
      description:
        'This permission was not in the expected set documented for this application and should be reviewed.',
      status: 'open',
    });
  }

  const debugLikeActivities = manifest.activities.filter((activity) =>
    /debug|test/i.test(activity),
  );
  for (const activity of debugLikeActivities) {
    findings.push({
      id: `SEC-ACT-${findings.length + 1}`,
      category: 'security',
      severity: FindingSeverity.Low,
      title: `Debug-named activity present in the manifest: ${activity}`,
      description:
        'A debug or test-named activity was found via heuristic string extraction. Whether it is exported could not be determined without aapt/apkanalyzer in this environment.',
      status: 'testability-issue',
    });
  }

  return findings;
}

function parseAuditFindings(auditJson: string): Finding[] {
  const report = JSON.parse(auditJson) as {
    metadata?: { vulnerabilities?: Record<string, number> };
  };
  const vulnerabilities = report.metadata?.vulnerabilities ?? {};
  const findings: Finding[] = [];

  for (const [level, count] of Object.entries(vulnerabilities)) {
    if (count > 0 && (level === 'high' || level === 'critical')) {
      findings.push({
        id: `SEC-DEP-${level}`,
        category: 'security',
        severity: level === 'critical' ? FindingSeverity.Critical : FindingSeverity.High,
        title: `${count} ${level} severity dependency vulnerabilities reported by npm audit`,
        description: 'Run `npm audit` for details on affected packages and available fixes.',
        status: 'open',
      });
    }
  }
  return findings;
}

async function buildDependencyFindings(): Promise<Finding[]> {
  try {
    const { stdout } = await exec('npm audit --json', { maxBuffer: 1024 * 1024 * 10 });
    return parseAuditFindings(stdout);
  } catch (error) {
    const execError = error as { stdout?: string };
    if (!execError.stdout) {
      throw error;
    }
    return parseAuditFindings(execError.stdout);
  }
}

async function main(): Promise<void> {
  const env = loadEnv();
  const apkPackage = await inspectApkPackage(env.androidAppPath);
  const manifest = await analyzeManifest(env.androidAppPath);

  const findings: Finding[] = [
    ...buildManifestFindings(manifest),
    ...buildSecretFindings(),
    ...(await buildDependencyFindings()),
  ];

  const summary = {
    generatedAt: new Date().toISOString(),
    disclaimer: 'This is a mobile security quality assessment, not a penetration test.',
    apkPackage,
    manifest,
    findings,
  };

  fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(summary, null, 2));

  console.log(
    `Security scan complete. ${findings.length} finding(s). Summary written to ${RESULTS_PATH}`,
  );
  for (const finding of findings) {
    console.log(`[${finding.severity}] ${finding.id}: ${finding.title}`);
  }

  const hasCritical = findings.some((finding) => finding.severity === FindingSeverity.Critical);
  if (hasCritical) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
