import fs from 'node:fs';
import path from 'node:path';

import { classifyFailure } from '../../utils/failureClassifier';
import { QualityCategory, QualityResult, QualitySource, QualityStatus } from '../types/result';
import { QualityEngineError } from '../validation/errors';
import { resolveWithinRoot } from '../validation/safePath';

import { TraceabilityEntry } from './traceability';

interface ParsedTestCase {
  name: string;
  classname: string;
  durationMs: number;
  status: QualityStatus;
  failureMessage?: string;
}

interface ParsedTestSuite {
  name: string;
  file?: string;
  testcases: ParsedTestCase[];
}

const TESTSUITE_BLOCK_PATTERN = /<testsuite\b([^>]*)>([\s\S]*?)<\/testsuite>/g;
const TESTCASE_PATTERN = /<testcase\b([^>]*?)\/>|<testcase\b([^>]*?)>([\s\S]*?)<\/testcase>/g;
const ATTRIBUTE_PATTERN = /(\w+)="([^"]*)"/g;

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#xA;/gi, '\n')
    .replace(/&amp;/g, '&');
}

function parseAttributes(attributeString: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const match of attributeString.matchAll(ATTRIBUTE_PATTERN)) {
    const [, key, value] = match;
    if (key !== undefined && value !== undefined) {
      attributes[key] = decodeXmlEntities(value);
    }
  }
  return attributes;
}

function extractFileProperty(body: string): string | undefined {
  const match = /<property\s+name="file"\s+value="([^"]*)"/.exec(body);
  return match?.[1] !== undefined ? decodeXmlEntities(match[1]) : undefined;
}

function parseTestCase(attributeString: string, body: string): ParsedTestCase {
  const attributes = parseAttributes(attributeString);
  const durationSeconds = Number.parseFloat(attributes.time ?? '0');

  let status: QualityStatus = QualityStatus.Passed;
  let failureMessage: string | undefined;

  const failureMatch = /<failure\b([^>]*)\/?>/.exec(body);
  const skippedMatch = /<skipped\b/.exec(body);

  if (failureMatch?.[1] !== undefined) {
    status = QualityStatus.Failed;
    failureMessage = parseAttributes(failureMatch[1]).message;
  } else if (skippedMatch) {
    status = QualityStatus.Skipped;
  }

  return {
    name: attributes.name ?? '',
    classname: attributes.classname ?? '',
    durationMs: Number.isFinite(durationSeconds) ? Math.round(durationSeconds * 1000) : 0,
    status,
    failureMessage,
  };
}

export function parseJunitXml(xml: string): ParsedTestSuite[] {
  if (!xml.includes('<testsuites') && !xml.includes('<testsuite')) {
    throw new QualityEngineError(
      'Input does not look like a WDIO JUnit report (no <testsuite> found)',
    );
  }

  const suites: ParsedTestSuite[] = [];

  for (const suiteMatch of xml.matchAll(TESTSUITE_BLOCK_PATTERN)) {
    const [, attributeString, body] = suiteMatch;
    if (attributeString === undefined || body === undefined) {
      continue;
    }

    const attributes = parseAttributes(attributeString);
    const file = extractFileProperty(body);
    const testcases: ParsedTestCase[] = [];

    for (const caseMatch of body.matchAll(TESTCASE_PATTERN)) {
      const selfClosingAttrs = caseMatch[1];
      const openAttrs = caseMatch[2];
      const caseBody = caseMatch[3] ?? '';
      const attributeString2 = selfClosingAttrs ?? openAttrs ?? '';
      testcases.push(parseTestCase(attributeString2, caseBody));
    }

    suites.push({ name: attributes.name ?? '', file, testcases });
  }

  return suites;
}

function suiteIdentifier(suite: ParsedTestSuite, fileBaseName: string): string {
  if (suite.file !== undefined && suite.file.length > 0) {
    return suite.file.replace(/^\.\//, '');
  }
  return suite.name.length > 0 ? suite.name : `unknown-suite (${fileBaseName})`;
}

export interface JunitCollectorOptions {
  testResultsDir?: string;
  executionId: string;
  timestamp: string;
  traceabilityBySpec: Map<string, TraceabilityEntry>;
  compatibilityProfile?: string;
}

export function collectJunitResults(
  root: string,
  options: JunitCollectorOptions,
): { results: QualityResult[]; filesParsed: number } {
  const testResultsDir = resolveWithinRoot(root, options.testResultsDir ?? 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    return { results: [], filesParsed: 0 };
  }

  const xmlFiles = fs
    .readdirSync(testResultsDir)
    .filter((entry) => entry.startsWith('results-') && entry.endsWith('.xml'));

  const results: QualityResult[] = [];
  let sequence = 0;

  for (const fileName of xmlFiles) {
    const filePath = path.join(testResultsDir, fileName);
    let xml: string;
    try {
      xml = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new QualityEngineError(`Could not read JUnit result file "${fileName}"`, error);
    }

    let suites: ParsedTestSuite[];
    try {
      suites = parseJunitXml(xml);
    } catch (error) {
      throw new QualityEngineError(`Could not parse JUnit result file "${fileName}"`, error);
    }

    for (const suite of suites) {
      const suiteId = suiteIdentifier(suite, fileName);
      const traceEntry =
        suite.file !== undefined
          ? options.traceabilityBySpec.get(suite.file.replace(/^\.\//, ''))
          : undefined;
      const category = traceEntry?.category ?? QualityCategory.Unknown;

      for (const testcase of suite.testcases) {
        sequence += 1;
        const failureCategory =
          testcase.status === QualityStatus.Failed && testcase.failureMessage !== undefined
            ? classifyFailure({ name: 'Error', message: testcase.failureMessage }).category
            : undefined;

        const result: QualityResult = {
          id: `junit-${options.executionId}-${sequence}`,
          executionId: options.executionId,
          timestamp: options.timestamp,
          source: QualitySource.Junit,
          category,
          suite: suiteId,
          test: testcase.name.length > 0 ? testcase.name : undefined,
          status: testcase.status,
          priority: traceEntry?.priority,
          criticalPath: traceEntry?.criticalPath,
          durationMs: testcase.durationMs,
          failureCategory,
          failureMessage: testcase.failureMessage,
          traceId: traceEntry?.id,
          environment:
            options.compatibilityProfile !== undefined
              ? { compatibilityProfile: options.compatibilityProfile }
              : undefined,
        };

        results.push(result);
      }
    }
  }

  return { results, filesParsed: xmlFiles.length };
}
