import * as chai from 'chai';
import { expect } from 'chai';
import { sanitiseSchema, superEndCb } from '@offscale/nodejs-utils';
import * as supertest from 'supertest';
import { Response } from 'supertest';
import { User } from '../../../api/user/models';
import { IncomingMessageError } from '@offscale/custom-restify-errors';
import { TCallback } from '@offscale/nodejs-utils/interfaces';
import { Contact } from '../../../api/contact/models';

const chaiJsonSchema = require('chai-json-schema');

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const contact_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class ContactTestSDK {
    constructor(public app) {
    }

    public create(access_token: string, contact: Contact,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `create` must be defined'));
        else if (contact == null) return callback(new TypeError('`contact` argument to `create` must be defined'));

        supertest(this.app)
            .post('/api/contact')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(contact)
            .expect('Content-Type', /json/)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);

                try {
                    expect(res.status).to.be.equal(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(contact_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public getAll(access_token: string, contact: Contact,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (contact == null) return callback(new TypeError('`contact` argument to `getAll` must be defined'));

        supertest(this.app)
            .get('/api/contact')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.have.property('owner');
                    expect(res.body).to.have.property('contacts');
                    expect(res.body.contacts).to.be.instanceOf(Array);
                    res.body.contacts.map(_contact => {
                        expect(_contact).to.be.an('object');
                        expect(_contact).to.be.jsonSchema(contact_schema);
                    });
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public retrieve(access_token: string, contact: Contact,
                    callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (contact == null) return callback(new TypeError('`contact` argument to `getAll` must be defined'));

        supertest(this.app)
            .get(`/api/contact/${contact.email}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(contact_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public update(access_token: string, initial_contact: Contact,
                  updated_contact: Contact, callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `update` must be defined'));
        else if (initial_contact == null)
            return callback(new TypeError('`initial_contact` argument to `update` must be defined'));
        else if (updated_contact == null)
            return callback(new TypeError('`updated_contact` argument to `update` must be defined'));
        else if (initial_contact.owner !== updated_contact.owner)
            return callback(
                new ReferenceError(`${initial_contact.owner} != ${updated_contact.owner} (\`owner\`s between contacts)`)
            );

        supertest(this.app)
            .put(`/api/contact/${initial_contact.email}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(updated_contact)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    Object.keys(updated_contact).map(
                        attr => expect(updated_contact[attr]).to.be.equal(res.body[attr])
                    );
                    expect(res.body).to.be.jsonSchema(contact_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }

    public destroy(access_token: string, contact: Contact,
                   callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (contact == null)
            return callback(new TypeError('`contact` argument to `destroy` must be defined'));

        supertest(this.app)
            .del(`/api/contact/${contact.email}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err);
                else if (res.error != null) return superEndCb(callback)(res.error);
                try {
                    expect(res.status).to.be.equal(204);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    superEndCb(callback)(err, res);
                }
            });
    }
}
