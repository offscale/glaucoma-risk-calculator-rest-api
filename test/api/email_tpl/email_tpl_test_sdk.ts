import * as supertest from 'supertest';
import { Response } from 'supertest';
import * as chai from 'chai';
import { expect } from 'chai';
import { sanitiseSchema } from 'nodejs-utils';
import * as chaiJsonSchema from 'chai-json-schema';
import { IEmailTplBase } from '../../../api/email_tpl/models.d';
import { User } from '../../../api/user/models';
import { IncomingMessageError, TCallback } from '../../shared_types';
import { getError, superEndCb } from '../../shared_tests';

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const email_tpl_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class EmailTplTestSDK {
    constructor(public app) {
    }

    public create(access_token: string, email_tpl: IEmailTplBase,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `create` must be defined'));
        else if (email_tpl == null) return callback(new TypeError('`email_tpl` argument to `create` must be defined'));

        supertest(this.app)
            .post('/api/email_tpl')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(email_tpl)
            .expect('Content-Type', /json/)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(err, res, callback);
                else if (res.error) return callback(getError(res.error));

                try {
                    expect(res.status).to.be.equal(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(email_tpl_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public get(access_token: string, email_tpl: IEmailTplBase,
               callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (email_tpl == null) return callback(new TypeError('`email_tpl` argument to `getAll` must be defined'));

        supertest(this.app)
            .get(`/api/email_tpl/${email_tpl.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(err, res, callback);
                else if (res.error) return callback(res.error);
                try {
                    expect(res.body).to.have.property('tpl');
                    expect(res.body.tpl).to.be.a('string');
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public update(access_token: string, initial_email_tpl: IEmailTplBase,
                  updated_email_tpl: IEmailTplBase, callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `update` must be defined'));
        else if (initial_email_tpl == null)
            return callback(new TypeError('`initial_email_tpl` argument to `update` must be defined'));
        else if (updated_email_tpl == null)
            return callback(new TypeError('`updated_email_tpl` argument to `update` must be defined'));
        else if (initial_email_tpl.createdAt !== updated_email_tpl.createdAt)
            return callback(new ReferenceError(
                `${initial_email_tpl.createdAt} != ${updated_email_tpl.createdAt} (\`createdAt\`s between email_tpls)`)
            );

        supertest(this.app)
            .put(`/api/email_tpl/${initial_email_tpl.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(updated_email_tpl)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(err, res, callback);
                else if (res.error) return callback(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    Object.keys(updated_email_tpl).map(
                        attr => expect(updated_email_tpl[attr]).to.be.equal(res.body[attr])
                    );
                    expect(res.body).to.be.jsonSchema(email_tpl_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public destroy(access_token: string, email_tpl: IEmailTplBase,
                   callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (email_tpl == null)
            return callback(new TypeError('`email_tpl` argument to `destroy` must be defined'));

        supertest(this.app)
            .del(`/api/email_tpl/${email_tpl.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(err, res, callback);
                else if (res.error) return callback(res.error);
                try {
                    expect(res.status).to.be.equal(204);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }
}
