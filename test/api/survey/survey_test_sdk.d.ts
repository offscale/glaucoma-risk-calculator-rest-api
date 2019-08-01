import { Response } from 'supertest';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { Survey } from '../../../api/survey/models';
export declare class SurveyTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: AccessTokenType, survey: Survey): Promise<Response>;
    get(access_token: AccessTokenType, survey: Survey): Promise<Response>;
    getAll(access_token: AccessTokenType): Promise<Response>;
    destroy(access_token: AccessTokenType, survey: Survey): Promise<Response>;
}
