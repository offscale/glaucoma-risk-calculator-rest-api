import { Response } from 'supertest';
import { RiskRes } from '../../../api/risk_res/models';
export declare class RiskResTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, risk_res: RiskRes): Promise<Response>;
    get(access_token: string, risk_res: RiskRes): Promise<Response>;
    getAll(access_token: string): Promise<Response>;
    destroy(access_token: string, risk_res: RiskRes): Promise<Response>;
}
