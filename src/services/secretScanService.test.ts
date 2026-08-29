import { describe, expect, it } from 'vitest';

import { scanForSecrets } from './secretScanService';

describe('scanForSecrets', () => {
  it('flags an AWS-style access key', () => {
    const matches = scanForSecrets([
      'loaded credentials AKIAABCDEFGHIJKLMNOP for region us-east-1',
    ]);
    expect(matches.map((match) => match.pattern)).toContain('aws-access-key');
  });

  it('flags a bearer token in an authorization header log line', () => {
    const matches = scanForSecrets(['Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp']);
    expect(matches.map((match) => match.pattern)).toContain('bearer-token');
  });

  it('flags a hardcoded password assignment', () => {
    const matches = scanForSecrets(['config.password = "sup3rSecretValue"']);
    expect(matches.map((match) => match.pattern)).toContain('password-assignment');
  });

  it('flags password-shaped assignments structurally, leaving context judgement to the report', () => {
    const matches = scanForSecrets(["const DEMO_PASSWORD = '10203040';"]);
    expect(matches.map((match) => match.pattern)).toEqual(['password-assignment']);
  });

  it('returns no matches for ordinary log output', () => {
    const matches = scanForSecrets(['catalog loaded with 6 products', 'cart badge updated to 2']);
    expect(matches).toEqual([]);
  });

  it('truncates long excerpts to keep reports readable', () => {
    const longKey = `api_key = "${'a'.repeat(80)}"`;
    const matches = scanForSecrets([longKey]);
    expect(matches[0]?.excerpt.length).toBeLessThanOrEqual(63);
  });
});
