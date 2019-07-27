import * as supertest from 'supertest';
import { Response } from 'supertest';
import { IConfigBase } from '../../../api/config/models.d';
import { TCallback } from '../../shared_types';
import { IncomingMessageError } from '@offscale/custom-restify-errors';
export declare class ConfigTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, config: IConfigBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    get(access_token: string, config: IConfigBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
