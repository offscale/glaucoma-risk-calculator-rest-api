import * as supertest from 'supertest';
import { Response } from 'supertest';
import { ISurvey, ISurveyBase } from '../../../api/survey/models.d';
import { TCallback } from '../../shared_types';
import { IncomingMessageError } from '@offscale/nodejs-utils/interfaces';
export declare class SurveyTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, survey: ISurveyBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    get(access_token: string, survey: ISurvey, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    getAll(access_token: string, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    destroy(access_token: string, survey: ISurveyBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
