import supertest, { Response } from 'supertest';
import * as chai from 'chai';
import { expect } from 'chai';

import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

import { User } from '../../../api/user/models';
import { RiskRes } from '../../../api/risk_res/models';
import * as risk_res_route from '../../../api/risk_res/route';
import * as risk_res_routes from '../../../api/risk_res/routes';
import { removeNullProperties } from '../../../utils';
import { isISODateString } from '../../../api/template/utils';

const chaiJsonSchema = require('chai-json-schema');

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const risk_res_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class RiskResTestSDK {
    constructor(public app) {
    }

    public create(access_token: AccessTokenType, risk_res: RiskRes): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null) return reject(new TypeError('`access_token` argument to `create` must be defined'));
            else if (risk_res == null) return reject(new TypeError('`risk_res` argument to `create` must be defined'));

            expect(risk_res_routes.create).to.be.an.instanceOf(Function);
            supertest(this.app)
                .post('/api/risk_res')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .send(risk_res)
                .expect('Content-Type', /json/)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));

                    try {
                        expect(res.status).to.be.equal(201);
                        expect(res.body).to.be.an('object');
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(risk_res_schema);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public get(access_token: AccessTokenType, risk_res: RiskRes): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null) return reject(new TypeError('`access_token` argument to `get` must be defined'));
            else if (risk_res == null) return reject(new TypeError('`risk_res` argument to `get` must be defined'));
            else if (risk_res.createdAt == null
                || !(risk_res.createdAt instanceof Date) && !isISODateString(risk_res.createdAt))
                return reject(new TypeError('`risk_res.createdAt` argument to `get` must be defined'));

            expect(risk_res_route.read).to.be.an.instanceOf(Function);
            supertest(this.app)
                .get(`/api/risk_res/${risk_res.id}`)
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));
                    try {
                        expect(res.body).to.be.an('object');
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(risk_res_schema);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public getAll(access_token: AccessTokenType): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null) return reject(new TypeError('`access_token` argument to `getAll` must be defined'));

            expect(risk_res_routes.getAll).to.be.an.instanceOf(Function);
            supertest(this.app)
                .get('/api/risk_res')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));
                    try {
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('risk_res');
                        expect(res.body.risk_res).to.be.an.instanceOf(Array);
                        res.body.risk_res.forEach(risk_res =>
                            expect(removeNullProperties(risk_res)).to.be.jsonSchema(risk_res_schema)
                        );
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public destroy(access_token: AccessTokenType, risk_res: RiskRes): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `destroy` must be defined'));
            else if (risk_res == null)
                return reject(new TypeError('`risk_res` argument to `destroy` must be defined'));
            else if (risk_res.createdAt == null
                || !(risk_res.createdAt instanceof Date) && !isISODateString(risk_res.createdAt))
                return reject(new TypeError('`risk_res.createdAt` argument to `getAll` must be defined'));

            expect(risk_res_route.read).to.be.an.instanceOf(Function);
            supertest(this.app)
                .del(`/api/risk_res/${new Date(risk_res.createdAt).toISOString()}`)
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
