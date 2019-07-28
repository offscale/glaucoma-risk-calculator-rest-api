import { Response } from 'supertest';
import { Config } from '../../../api/config/models';
export declare class ConfigTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, config: Config): Promise<Response>;
    get(access_token: string, config: Config): Promise<Response>;
}
