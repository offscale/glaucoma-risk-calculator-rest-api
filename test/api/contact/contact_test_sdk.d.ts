import * as supertest from 'supertest';
import { Response } from 'supertest';
import { IncomingMessageError } from '@offscale/custom-restify-errors';
import { TCallback } from '@offscale/nodejs-utils/interfaces';
import { Contact } from '../../../api/contact/models';
export declare class ContactTestSDK {
    app: any;
    constructor(app: any);
    create(access_token: string, contact: Contact, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    getAll(access_token: string, contact: Contact, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    retrieve(access_token: string, contact: Contact, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    update(access_token: string, initial_contact: Contact, updated_contact: Contact, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
    destroy(access_token: string, contact: Contact, callback: TCallback<Error | IncomingMessageError, Response>): void | supertest.Response;
}
