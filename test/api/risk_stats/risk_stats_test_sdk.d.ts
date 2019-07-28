import * as supertest from 'supertest';
import { Response } from 'supertest';
import { IncomingMessageError } from '@offscale/custom-restify-errors';
import { TCallback } from '@offscale/nodejs-utils/interfaces';
import { RiskStats } from '../../../api/risk_stats/models';
export declare class RiskStatsTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, risk_stats: RiskStats, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    get(access_token: string, risk_stats: RiskStats, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    update(access_token: string, initial_risk_stats: RiskStats, updated_risk_stats: Partial<RiskStats>, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    destroy(access_token: string, risk_stats: RiskStats, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
