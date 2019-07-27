import * as supertest from 'supertest';
import { Response } from 'supertest';
import { ITemplateBase } from '../../../api/template/models.d';
import { IncomingMessageError, TCallback } from '../../shared_types';
export declare class TemplateTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, template: ITemplateBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    get(access_token: string, template: ITemplateBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    update(access_token: string, initial_template: ITemplateBase, updated_template: ITemplateBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    destroy(access_token: string, template: ITemplateBase, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
