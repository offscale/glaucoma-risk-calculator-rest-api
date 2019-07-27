import * as supertest from 'supertest';
import { Response } from 'supertest';
import { IRiskStatsBase } from '../../../api/risk_stats/models.d';
import { TCallback } from '../../shared_types';
import { IncomingMessageError } from '@offscale/custom-restify-errors';
export declare class RiskStatsTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, risk_stats: IRiskStatsBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    get(access_token: string, risk_stats: IRiskStatsBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    update(access_token: string, initial_risk_stats: IRiskStatsBase, updated_risk_stats: IRiskStatsBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    destroy(access_token: string, risk_stats: IRiskStatsBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
