import { describe, expect, it } from 'vitest';

import { summarizeApkEntries } from './apkPackageService';

describe('summarizeApkEntries', () => {
  const baseEntries = [
    'AndroidManifest.xml',
    'resources.arsc',
    'classes.dex',
    'classes2.dex',
    'lib/arm64-v8a/libnative.so',
    'lib/armeabi-v7a/libnative.so',
    'META-INF/CERT.RSA',
  ];

  it('counts dex files across multidex splits', () => {
    const info = summarizeApkEntries('app.apk', 1024, baseEntries);
    expect(info.dexFileCount).toBe(2);
  });

  it('collects distinct native library ABIs in sorted order', () => {
    const info = summarizeApkEntries('app.apk', 1024, baseEntries);
    expect(info.nativeLibraryAbis).toEqual(['arm64-v8a', 'armeabi-v7a']);
  });

  it('detects the manifest and resource table entries', () => {
    const info = summarizeApkEntries('app.apk', 1024, baseEntries);
    expect(info.hasAndroidManifest).toBe(true);
    expect(info.hasResourcesArsc).toBe(true);
  });

  it('detects signing material under META-INF', () => {
    const info = summarizeApkEntries('app.apk', 1024, baseEntries);
    expect(info.signed).toBe(true);
  });

  it('reports unsigned when no signature block is present', () => {
    const info = summarizeApkEntries('app.apk', 1024, ['classes.dex']);
    expect(info.signed).toBe(false);
  });

  it('reports the total entry count and requested file size', () => {
    const info = summarizeApkEntries('app.apk', 2048, baseEntries);
    expect(info.entryCount).toBe(baseEntries.length);
    expect(info.fileSizeBytes).toBe(2048);
  });
});
