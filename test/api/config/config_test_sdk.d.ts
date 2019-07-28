import * as supertest from 'supertest';
import { Response } from 'supertest';
import { IncomingMessageError } from '@offscale/custom-restify-errors';
import { TCallback } from '@offscale/nodejs-utils/interfaces';
import { Config } from '../../../api/config/models';
export declare class ConfigTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, config: Config, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    get(access_token: string, config: Config, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
