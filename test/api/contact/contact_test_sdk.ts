import * as chai from 'chai';
import { expect } from 'chai';
import supertest, { Response } from 'supertest';

import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

import { User } from '../../../api/user/models';
import { Contact } from '../../../api/contact/models';
import * as contact_routes from '../../../api/contact/routes';
import * as contact_route from '../../../api/contact/route';
import { removeNullProperties } from '../../../utils';

const chaiJsonSchema = require('chai-json-schema');

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const contact_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class ContactTestSDK {
    constructor(public app) {}

    public create(access_token: AccessTokenType, contact: Contact): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null) return reject(new TypeError('`access_token` argument to `create` must be defined'));
            else if (contact == null) return reject(new TypeError('`contact` argument to `create` must be defined'));

            expect(contact_routes.create).to.be.an.instanceOf(Function);
            supertest(this.app)
                .post('/api/contact')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .send(contact)
                .expect('Content-Type', /json/)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));

                    try {
                        expect(res.status).to.be.equal(201);
                        expect(res.body).to.be.an('object');
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(contact_schema);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public getAll(access_token: AccessTokenType, contact: Contact): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `getAll` must be defined'));
            else if (contact == null)
                return reject(new TypeError('`contact` argument to `getAll` must be defined'));

            expect(contact_routes.read).to.be.an.instanceOf(Function);
            supertest(this.app)
                .get('/api/contact')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));
                    try {
                        expect(res.body).to.have.property('owner');
                        expect(res.body).to.have.property('contacts');
                        expect(res.body.contacts).to.be.instanceOf(Array);
                        res.body.contacts.map(_contact => {
                            expect(_contact).to.be.an('object');
                            expect(removeNullProperties(_contact)).to.be.jsonSchema(contact_schema);
                        });
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }

                    return resolve(res);
                });
        });
    }

    public retrieve(access_token: AccessTokenType, contact: Contact): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null) return reject(new TypeError('`access_token` argument to `getAll` must be defined'));
            else if (contact == null) return reject(new TypeError('`contact` argument to `getAll` must be defined'));

            expect(contact_route.read).to.be.an.instanceOf(Function);
            supertest(this.app)
                .get(`/api/contact/${contact.email}`)
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));
                    try {
                        expect(res.body).to.be.an('object');
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(contact_schema);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public update(access_token: AccessTokenType, initial_contact: Contact, updated_contact: Contact): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `update` must be defined'));
            else if (initial_contact == null)
                return reject(new TypeError('`initial_contact` argument to `update` must be defined'));
            else if (updated_contact == null)
                return reject(new TypeError('`updated_contact` argument to `update` must be defined'));
            else if (initial_contact.owner !== updated_contact.owner)
                return reject(
                    new ReferenceError(`${initial_contact.owner} != ${updated_contact.owner} (\`owner\`s between contacts)`)
                );

            expect(contact_route.update).to.be.an.instanceOf(Function);
            supertest(this.app)
                .put(`/api/contact/${initial_contact.email}`)
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .send(updated_contact)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));
                    try {
                        expect(res.body).to.be.an('object');
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(contact_schema);
                        expect(removeNullProperties(updated_contact)).to.be.jsonSchema(contact_schema);
                        Object
                            .keys(updated_contact)
                            .filter(attr => updated_contact[attr] == null)
                            .map(attr => expect(updated_contact[attr]).to.be.equal(res.body[attr]));
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public destroy(access_token: AccessTokenType, contact: Contact): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `destroy` must be defined'));
            else if (contact == null)
                return reject(new TypeError('`contact` argument to `destroy` must be defined'));

            expect(contact_route.del).to.be.an.instanceOf(Function);
            supertest(this.app)
                .del(`/api/contact/${contact.email}`)
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));
                    try {
                        expect(res.status).to.be.equal(204);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }
}
