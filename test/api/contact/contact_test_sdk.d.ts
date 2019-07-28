import { Response } from 'supertest';
import { Contact } from '../../../api/contact/models';
export declare class ContactTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, contact: Contact): Promise<Response>;
    getAll(access_token: string, contact: Contact): Promise<Response>;
    retrieve(access_token: string, contact: Contact): Promise<Response>;
    update(access_token: string, initial_contact: Contact, updated_contact: Contact): Promise<Response>;
    destroy(access_token: string, contact: Contact): Promise<Response>;
}
