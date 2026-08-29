import { execFileSync } from 'node:child_process';

export interface GitMetadata {
  branch?: string;
  commitSha?: string;
  pullRequest?: string;
}

function runGit(args: string[]): string | undefined {
  try {
    return execFileSync('git', args, { encoding: 'utf-8' }).trim();
  } catch {
    return undefined;
  }
}

export function collectGitMetadata(env: NodeJS.ProcessEnv = process.env): GitMetadata {
  const branch =
    env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME || runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
  const commitSha = env.GITHUB_SHA || runGit(['rev-parse', 'HEAD']);
  const pullRequestMatch = /refs\/pull\/(\d+)\//.exec(env.GITHUB_REF ?? '');

  return {
    branch: branch === '' ? undefined : branch,
    commitSha: commitSha === '' ? undefined : commitSha,
    pullRequest: pullRequestMatch?.[1],
  };
}
