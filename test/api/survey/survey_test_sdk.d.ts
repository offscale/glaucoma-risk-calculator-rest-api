import { Response } from 'supertest';
import { Survey } from '../../../api/survey/models';
export declare class SurveyTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, survey: Survey): Promise<Response>;
    get(access_token: string, survey: Survey): Promise<Response>;
    getAll(access_token: string): Promise<Response>;
    destroy(access_token: string, survey: Survey): Promise<Response>;
}
