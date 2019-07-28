import { Response } from 'supertest';
import { Template } from '../../../api/template/models';
export declare class TemplateTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, template: Template): Promise<Response>;
    get(access_token: string, template: Template): Promise<Response>;
    update(access_token: string, initial_template: Template, updated_template: Template): Promise<Response>;
    destroy(access_token: string, template: Template): Promise<Response>;
}
