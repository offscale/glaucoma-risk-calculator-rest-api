import { Response } from 'supertest';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { Config } from '../../../api/config/models';
export declare class ConfigTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: AccessTokenType, config: Config): Promise<Response>;
    get(access_token: AccessTokenType, config: Config): Promise<Response>;
}
