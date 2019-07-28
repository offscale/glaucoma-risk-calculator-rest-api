import * as supertest from 'supertest';
import { Response } from 'supertest';
import { IncomingMessageError, TCallback } from '@offscale/nodejs-utils/interfaces';
import { RiskRes } from '../../../api/risk_res/models';
export declare class RiskResTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, risk_res: RiskRes, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    get(access_token: string, risk_res: RiskRes, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    getAll(access_token: string, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    destroy(access_token: string, risk_res: RiskRes, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
