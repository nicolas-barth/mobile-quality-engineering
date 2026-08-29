export interface SecretMatch {
  pattern: string;
  excerpt: string;
}

interface SecretPattern {
  name: string;
  pattern: RegExp;
}

const SECRET_PATTERNS: SecretPattern[] = [
  { name: 'aws-access-key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'generic-api-key-assignment', pattern: /api[_-]?key\s*[=:]\s*['"][^'"\s]{12,}['"]/gi },
  { name: 'bearer-token', pattern: /bearer\s+[a-zA-Z0-9._-]{20,}/gi },
  { name: 'private-key-block', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { name: 'password-assignment', pattern: /password\s*[=:]\s*['"][^'"\s]{4,}['"]/gi },
];

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export function scanForSecrets(lines: string[]): SecretMatch[] {
  const matches: SecretMatch[] = [];

  for (const line of lines) {
    for (const { name, pattern } of SECRET_PATTERNS) {
      const found = line.match(pattern);
      if (found) {
        for (const excerpt of found) {
          matches.push({ pattern: name, excerpt: truncate(excerpt, 60) });
        }
      }
    }
  }

  return matches;
}
