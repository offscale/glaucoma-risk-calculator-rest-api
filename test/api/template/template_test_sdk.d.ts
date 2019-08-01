import { Response } from 'supertest';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { Template } from '../../../api/template/models';
export declare class TemplateTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: AccessTokenType, template: Template): Promise<Response>;
    get(access_token: AccessTokenType, template: Template): Promise<Response>;
    update(access_token: AccessTokenType, initial_template: Template, updated_template: Template): Promise<Response>;
    destroy(access_token: AccessTokenType, template: Template): Promise<Response>;
}
