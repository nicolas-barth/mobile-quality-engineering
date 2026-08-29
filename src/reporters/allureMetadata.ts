import allureReporter from '@wdio/allure-reporter';

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

export interface TestMetadata {
  epic: string;
  feature: string;
  story: string;
  severity: Severity;
  tags?: string[];
}

const PROJECT_OWNER = 'Mobile Quality Engineering';

export async function applyTestMetadata(metadata: TestMetadata): Promise<void> {
  await allureReporter.addEpic(metadata.epic);
  await allureReporter.addFeature(metadata.feature);
  await allureReporter.addStory(metadata.story);
  await allureReporter.addSeverity(metadata.severity);
  await allureReporter.addOwner(PROJECT_OWNER);
  for (const tag of metadata.tags ?? []) {
    await allureReporter.addTag(tag);
  }
}
