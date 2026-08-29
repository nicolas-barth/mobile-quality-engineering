import { describe, expect, it } from 'vitest';

import { collectGitMetadata } from './gitMetadata';

describe('collectGitMetadata', () => {
  it('prefers CI-provided branch, commit and pull request over local git state', () => {
    const metadata = collectGitMetadata({
      GITHUB_HEAD_REF: 'feature/quality-intelligence',
      GITHUB_SHA: 'abc1234',
      GITHUB_REF: 'refs/pull/42/merge',
    });

    expect(metadata).toEqual({
      branch: 'feature/quality-intelligence',
      commitSha: 'abc1234',
      pullRequest: '42',
    });
  });

  it('falls back to local git state when no CI environment variables are set', () => {
    const metadata = collectGitMetadata({});

    expect(metadata.pullRequest).toBeUndefined();
  });
});
