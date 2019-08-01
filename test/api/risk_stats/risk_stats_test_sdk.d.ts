import { Response } from 'supertest';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { RiskStats } from '../../../api/risk_stats/models';
export declare class RiskStatsTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: AccessTokenType, risk_stats: RiskStats): Promise<Response>;
    get(access_token: AccessTokenType, risk_stats: RiskStats): Promise<Response>;
    update(access_token: AccessTokenType, initial_risk_stats: RiskStats, updated_risk_stats: Partial<RiskStats>): Promise<Response>;
    destroy(access_token: AccessTokenType, risk_stats: RiskStats): Promise<Response>;
}
