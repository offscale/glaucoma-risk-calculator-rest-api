import * as supertest from 'supertest';
import { Response } from 'supertest';
import { IRiskRes, IRiskResBase } from '../../../api/risk_res/models.d';
import { TCallback } from '../../shared_types';
import { IncomingMessageError } from '@offscale/nodejs-utils/interfaces';
export declare class RiskResTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, risk_res: IRiskResBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    get(access_token: string, risk_res: IRiskRes, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    getAll(access_token: string, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    destroy(access_token: string, risk_res: IRiskResBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
