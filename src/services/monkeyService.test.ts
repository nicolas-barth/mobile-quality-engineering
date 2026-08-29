import { describe, expect, it } from 'vitest';

import { buildMonkeyArgs, parseMonkeyOutput } from './monkeyService';

describe('buildMonkeyArgs', () => {
  it('builds a deterministic adb monkey invocation from the given options', () => {
    const args = buildMonkeyArgs({
      packageName: 'com.saucelabs.mydemoapp.android',
      seed: 1234,
      throttleMs: 200,
      eventCount: 500,
    });

    expect(args).toEqual([
      'shell',
      'monkey',
      '-p',
      'com.saucelabs.mydemoapp.android',
      '-s',
      '1234',
      '--throttle',
      '200',
      '-v',
      '500',
    ]);
  });
});

describe('parseMonkeyOutput', () => {
  it('detects a crash from a FATAL EXCEPTION marker', () => {
    const result = parseMonkeyOutput('// FATAL EXCEPTION: main\n** Monkey aborted due to error.');
    expect(result.crashDetected).toBe(true);
    expect(result.anrDetected).toBe(false);
  });

  it('detects a crash from the CRASH marker used by Monkey itself', () => {
    const result = parseMonkeyOutput('// CRASH: com.saucelabs.mydemoapp.android');
    expect(result.crashDetected).toBe(true);
  });

  it('detects an ANR marker independently of crash markers', () => {
    const result = parseMonkeyOutput('// NOT RESPONDING: com.saucelabs.mydemoapp.android');
    expect(result.anrDetected).toBe(true);
    expect(result.crashDetected).toBe(false);
  });

  it('reports no crash or ANR for a clean run', () => {
    const result = parseMonkeyOutput('Events injected: 500\n// Monkey finished');
    expect(result).toEqual({ crashDetected: false, anrDetected: false });
  });
});
