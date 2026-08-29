import Ajv, { type Schema } from 'ajv';

import { FailureCategory } from '../../types/failure';
import { QualityCategory, QualitySource, QualityStatus } from '../types/result';

export const qualityResultSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    executionId: { type: 'string', minLength: 1 },
    timestamp: { type: 'string', minLength: 1 },
    source: { type: 'string', enum: Object.values(QualitySource) },
    category: { type: 'string', enum: Object.values(QualityCategory) },
    suite: { type: 'string', minLength: 1 },
    test: { type: 'string' },
    status: { type: 'string', enum: Object.values(QualityStatus) },
    priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
    criticalPath: { type: 'boolean' },
    durationMs: { type: 'number', minimum: 0 },
    retryCount: { type: 'integer', minimum: 0 },
    failureCategory: { type: 'string', enum: Object.values(FailureCategory) },
    failureMessage: { type: 'string' },
    environment: { type: 'object' },
    evidence: { type: 'array' },
    traceId: { type: 'string' },
  },
  required: ['id', 'executionId', 'timestamp', 'source', 'category', 'suite', 'status'],
  additionalProperties: true,
};

export const qualityExecutionSchema: Schema = {
  type: 'object',
  properties: {
    executionId: { type: 'string', minLength: 1 },
    startedAt: { type: 'string', minLength: 1 },
    completedAt: { type: 'string', minLength: 1 },
    branch: { type: 'string' },
    commitSha: { type: 'string' },
    pullRequest: { type: 'string' },
    appVersion: { type: 'string' },
    platform: { type: 'string', minLength: 1 },
    device: { type: 'string' },
    androidVersion: { type: 'string' },
    environment: { type: 'string', minLength: 1 },
    trigger: { type: 'string', minLength: 1 },
    dataMode: { type: 'string', enum: ['REAL', 'SIMULATED'] },
    results: { type: 'array', items: qualityResultSchema },
  },
  required: [
    'executionId',
    'startedAt',
    'completedAt',
    'platform',
    'environment',
    'trigger',
    'dataMode',
    'results',
  ],
  additionalProperties: true,
};

export function createAjv(): Ajv {
  return new Ajv({ allErrors: true, strict: false });
}
