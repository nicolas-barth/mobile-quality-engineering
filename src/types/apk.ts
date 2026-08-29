export interface ApkPackageInfo {
  filePath: string;
  fileSizeBytes: number;
  entryCount: number;
  dexFileCount: number;
  hasResourcesArsc: boolean;
  hasAndroidManifest: boolean;
  nativeLibraryAbis: string[];
  signed: boolean;
}

export type ManifestAnalysisMethod = 'aapt' | 'heuristic-string-scan';

export interface ManifestAnalysisResult {
  method: ManifestAnalysisMethod;
  packageName: string | null;
  permissions: string[];
  activities: string[];
  services: string[];
  providers: string[];
  receivers: string[];
}
