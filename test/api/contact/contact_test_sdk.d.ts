import { Response } from 'supertest';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';
import { Contact } from '../../../api/contact/models';
export declare class ContactTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: AccessTokenType, contact: Contact): Promise<Response>;
    getAll(access_token: AccessTokenType, contact: Contact): Promise<Response>;
    retrieve(access_token: AccessTokenType, contact: Contact): Promise<Response>;
    update(access_token: AccessTokenType, initial_contact: Contact, updated_contact: Contact): Promise<Response>;
    destroy(access_token: AccessTokenType, contact: Contact): Promise<Response>;
}
