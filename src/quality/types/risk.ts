export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const RESIDUAL_RISK_ORDER: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export interface RiskContributor {
  description: string;
  level: RiskLevel;
  traceId?: string;
  category?: string;
}

export interface ResidualRisk {
  level: RiskLevel;
  contributors: RiskContributor[];
}
