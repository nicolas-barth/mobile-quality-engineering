import fs from 'node:fs';
import path from 'node:path';

export function sanitizeForFileSystem(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function createRunTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
}

export function ensureDirectory(directoryPath: string): string {
  fs.mkdirSync(directoryPath, { recursive: true });
  return directoryPath;
}

export function resolveFromRoot(...segments: string[]): string {
  return path.resolve(process.cwd(), ...segments);
}
