import supertest, { Response } from 'supertest';
import * as chai from 'chai';
import { expect } from 'chai';

import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

import { User } from '../../../api/user/models';
import { Template } from '../../../api/template/models';
import * as template_route from '../../../api/template/route';
import * as template_routes from '../../../api/template/routes';
import { removeNullProperties } from '../../../utils';

const chaiJsonSchema = require('chai-json-schema');

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const template_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class TemplateTestSDK {
    constructor(public app) {
    }

    public create(access_token: AccessTokenType, template: Template): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `create` must be defined'));
            else if (template == null)
                return reject(new TypeError('`template` argument to `create` must be defined'));

            expect(template_routes.create).to.be.an.instanceOf(Function);
            supertest(this.app)
                .post('/api/template')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .send(template)
                .expect('Content-Type', /json/)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));

                    try {
                        expect(res.status).to.be.equal(201);
                        expect(res.body).to.be.an('object');
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(template_schema);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public get(access_token: AccessTokenType, template: Template, by_id: boolean = true): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `getAll` must be defined'));
            else if (template == null)
                return reject(new TypeError('`template` argument to `getAll` must be defined'));

            expect(template_route.read).to.be.an.instanceOf(Function);
            supertest(this.app)
                .get(
                    `/api/template/${by_id ? template.id : new Date(template.createdAt).toISOString()
                    }_${template.kind}`
                )
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));

                    try {
                        expect(res.body).to.have.property('contents');
                        expect(res.body.contents).to.be.a('string');
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public update(access_token: AccessTokenType,
                  initial_template: Template,
                  updated_template: Template): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `update` must be defined'));
            else if (initial_template == null)
                return reject(new TypeError('`initial_template` argument to `update` must be defined'));
            else if (updated_template == null)
                return reject(new TypeError('`updated_template` argument to `update` must be defined'));
            else if (initial_template.createdAt !== updated_template.createdAt)
                return reject(new ReferenceError(
                    `${initial_template.createdAt.toISOString()} 
                    != ${updated_template.createdAt.toISOString()}
                     (\`createdAt\`s between templates)`)
                );

            expect(template_route.update).to.be.an.instanceOf(Function);
            supertest(this.app)
                .put(`/api/template/${new Date(initial_template.createdAt).toISOString()}`)
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .send(updated_template)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));

                    try {
                        expect(res.body).to.be.an('object');
                        Object
                            .keys(updated_template)
                            .filter(attr => ['createdAt', 'updatedAt'].indexOf(attr) === -1)
                            .map(attr => expect(updated_template[attr]).to.be.equal(res.body[attr]));
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(template_schema);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public destroy(access_token: AccessTokenType, template: Template): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `destroy` must be defined'));
            else if (template == null)
                return reject(new TypeError('`template` argument to `destroy` must be defined'));

            expect(template_route.del).to.be.an.instanceOf(Function);
            supertest(this.app)
                .del(`/api/template/${new Date(template.createdAt).toISOString()}`)
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
