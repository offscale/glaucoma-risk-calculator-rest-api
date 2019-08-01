import { Response } from 'supertest';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { RiskRes } from '../../../api/risk_res/models';
export declare class RiskResTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: AccessTokenType, risk_res: RiskRes): Promise<Response>;
    get(access_token: AccessTokenType, risk_res: RiskRes): Promise<Response>;
    getAll(access_token: AccessTokenType): Promise<Response>;
    destroy(access_token: AccessTokenType, risk_res: RiskRes): Promise<Response>;
}
