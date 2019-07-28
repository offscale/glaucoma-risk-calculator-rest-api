import { Response } from 'supertest';
import { RiskStats } from '../../../api/risk_stats/models';
export declare class RiskStatsTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, risk_stats: RiskStats): Promise<Response>;
    get(access_token: string, risk_stats: RiskStats): Promise<Response>;
    update(access_token: string, initial_risk_stats: RiskStats, updated_risk_stats: Partial<RiskStats>): Promise<Response>;
    destroy(access_token: string, risk_stats: RiskStats): Promise<Response>;
}
