import { execFile as execFileCallback } from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';

import { ApkPackageInfo } from '../types/apk';

const execFile = promisify(execFileCallback);

const NATIVE_LIBRARY_ENTRY_PATTERN = /^lib\/([^/]+)\//;
const DEX_ENTRY_PATTERN = /^classes\d*\.dex$/;
const SIGNATURE_ENTRY_PATTERN = /^META-INF\/.+\.(RSA|DSA|EC)$/;

export function summarizeApkEntries(
  filePath: string,
  fileSizeBytes: number,
  entries: string[],
): ApkPackageInfo {
  const nativeLibraryAbis = new Set<string>();
  let dexFileCount = 0;
  let hasResourcesArsc = false;
  let hasAndroidManifest = false;
  let signed = false;

  for (const entry of entries) {
    const nativeLibraryMatch = NATIVE_LIBRARY_ENTRY_PATTERN.exec(entry);
    if (nativeLibraryMatch?.[1]) {
      nativeLibraryAbis.add(nativeLibraryMatch[1]);
    }
    if (DEX_ENTRY_PATTERN.test(entry)) {
      dexFileCount += 1;
    }
    if (entry === 'resources.arsc') {
      hasResourcesArsc = true;
    }
    if (entry === 'AndroidManifest.xml') {
      hasAndroidManifest = true;
    }
    if (SIGNATURE_ENTRY_PATTERN.test(entry)) {
      signed = true;
    }
  }

  return {
    filePath,
    fileSizeBytes,
    entryCount: entries.length,
    dexFileCount,
    hasResourcesArsc,
    hasAndroidManifest,
    nativeLibraryAbis: [...nativeLibraryAbis].sort(),
    signed,
  };
}

export async function inspectApkPackage(apkPath: string): Promise<ApkPackageInfo> {
  if (!fs.existsSync(apkPath)) {
    throw new Error(`APK not found at "${apkPath}"`);
  }

  const { stdout } = await execFile('unzip', ['-Z1', apkPath]);
  const entries = stdout.split('\n').filter((entry) => entry.length > 0);

  return summarizeApkEntries(apkPath, fs.statSync(apkPath).size, entries);
}
