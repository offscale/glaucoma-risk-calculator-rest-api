import * as supertest from 'supertest';
import { Response } from 'supertest';
import * as chai from 'chai';
import { expect } from 'chai';
import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
const chaiJsonSchema = require('chai-json-schema');
import { ITemplateBase } from '../../../api/template/models.d';
import { User } from '../../../api/user/models';
import { IncomingMessageError, TCallback } from '../../shared_types';

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const template_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class TemplateTestSDK {
    constructor(public app) {
    }

    public create(access_token: string, template: ITemplateBase,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `create` must be defined'));
        else if (template == null) return callback(new TypeError('`template` argument to `create` must be defined'));

        supertest(this.app)
            .post('/api/template')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(template)
            .expect('Content-Type', /json/)
            .end((err, res: Response) => {
                if (err != null) throw supertestGetError(err, res);
                else if (res.error) return callback(getError(res.error));

                try {
                    expect(res.status).to.be.equal(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(template_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public get(access_token: string, template: ITemplateBase,
               callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null) return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (template == null) return callback(new TypeError('`template` argument to `getAll` must be defined'));

        supertest(this.app)
            .get(`/api/template/${template.createdAt}_${template.kind}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) throw supertestGetError(err, res);
                else if (res.error) return callback(res.error);
                try {
                    expect(res.body).to.have.property('contents');
                    expect(res.body.contents).to.be.a('string');
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public update(access_token: string, initial_template: ITemplateBase,
                  updated_template: ITemplateBase, callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `update` must be defined'));
        else if (initial_template == null)
            return callback(new TypeError('`initial_template` argument to `update` must be defined'));
        else if (updated_template == null)
            return callback(new TypeError('`updated_template` argument to `update` must be defined'));
        else if (initial_template.createdAt !== updated_template.createdAt)
            return callback(new ReferenceError(
                `${initial_template.createdAt} != ${updated_template.createdAt} (\`createdAt\`s between templates)`)
            );

        supertest(this.app)
            .put(`/api/template/${initial_template.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(updated_template)
            .end((err, res: Response) => {
                if (err != null) throw supertestGetError(err, res);
                else if (res.error) return callback(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    Object.keys(updated_template).map(
                        attr => expect(updated_template[attr]).to.be.equal(res.body[attr])
                    );
                    expect(res.body).to.be.jsonSchema(template_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public destroy(access_token: string, template: ITemplateBase,
                   callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (template == null)
            return callback(new TypeError('`template` argument to `destroy` must be defined'));

        supertest(this.app)
            .del(`/api/template/${template.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .end((err, res: Response) => {
                if (err != null) throw supertestGetError(err, res);
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
