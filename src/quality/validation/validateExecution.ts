import { QualityExecution } from '../types/execution';
import { QualityResult } from '../types/result';

import { QualityEngineError } from './errors';
import { createAjv, qualityExecutionSchema } from './schemas';

const ajv = createAjv();
const validateSchema = ajv.compile(qualityExecutionSchema);

function assertParsableTimestamp(label: string, value: string): void {
  if (Number.isNaN(Date.parse(value))) {
    throw new QualityEngineError(`${label} is not a parsable ISO 8601 timestamp: "${value}"`);
  }
}

function assertNoDuplicateIds(results: QualityResult[]): void {
  const seen = new Set<string>();
  for (const result of results) {
    if (seen.has(result.id)) {
      throw new QualityEngineError(`Duplicate quality result id detected: "${result.id}"`);
    }
    seen.add(result.id);
  }
}

export function validateQualityExecution(data: unknown): QualityExecution {
  if (!validateSchema(data)) {
    const details = (validateSchema.errors ?? [])
      .map((error) => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`)
      .join('; ');
    throw new QualityEngineError(`Invalid quality execution data: ${details}`);
  }

  const execution = data as QualityExecution;

  assertParsableTimestamp('startedAt', execution.startedAt);
  assertParsableTimestamp('completedAt', execution.completedAt);
  for (const result of execution.results) {
    assertParsableTimestamp(`result "${result.id}" timestamp`, result.timestamp);
  }
  assertNoDuplicateIds(execution.results);

  return execution;
}
