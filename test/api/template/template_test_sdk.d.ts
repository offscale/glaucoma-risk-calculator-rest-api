import * as supertest from 'supertest';
import { Response } from 'supertest';
import { IncomingMessageError } from '@offscale/custom-restify-errors';
import { TCallback } from '@offscale/nodejs-utils/interfaces';
import { Template } from '../../../api/template/models';
export declare class TemplateTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, template: Template, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    get(access_token: string, template: Template, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    update(access_token: string, initial_template: Template, updated_template: Template, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    destroy(access_token: string, template: Template, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
