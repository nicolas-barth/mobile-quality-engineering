export type GateStatus = 'PASS' | 'FAIL' | 'WARNING' | 'NOT_EVALUATED';

export interface QualityGateResult {
  id: string;
  name: string;
  category: string;
  status: GateStatus;
  expected: string;
  actual: string;
  reason: string;
  blocking: boolean;
}
