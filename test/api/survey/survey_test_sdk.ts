import supertest, { Response } from 'supertest';
import * as chai from 'chai';
import { expect } from 'chai';

import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

import { User } from '../../../api/user/models';
import { Survey } from '../../../api/survey/models';
import * as survey_route from '../../../api/survey/route';
import * as survey_routes from '../../../api/survey/routes';
import { removeNullProperties } from '../../../utils';

const chaiJsonSchema = require('chai-json-schema');

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const survey_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class SurveyTestSDK {
    constructor(public app) {
    }

    public create(access_token: AccessTokenType, survey: Survey): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null) return reject(new TypeError('`access_token` argument to `create` must be defined'));
            else if (survey == null) return reject(new TypeError('`survey` argument to `create` must be defined'));

            expect(survey_routes.create).to.be.an.instanceOf(Function);
            supertest(this.app)
                .post('/api/survey')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .send(survey)
                .expect('Content-Type', /json/)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));

                    try {
                        expect(res.status).to.be.equal(201);
                        expect(res.body).to.be.an('object');
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(survey_schema);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public get(access_token: AccessTokenType, survey: Survey): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null) return reject(new TypeError('`access_token` argument to `getAll` must be defined'));
            else if (survey == null) return reject(new TypeError('`survey` argument to `getAll` must be defined'));
            /*else if (isNaN(survey.createdAt as any))
             return callback(new TypeError(`\`survey.createdAt\` must not be NaN in \`getAll\` ${survey.createdAt.toISOString()}`);*/

            expect(survey_route.read).to.be.an.instanceOf(Function);
            supertest(this.app)
                .get(`/api/survey/${new Date(survey.createdAt).toISOString()}`)
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));
                    try {
                        expect(res.body).to.be.an('object');
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(survey_schema);
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
            /*else if (isNaN(survey.createdAt as any))
             return callback(new TypeError(`\`survey.createdAt\` must not be NaN in \`getAll\` ${survey.createdAt.toISOString()}`);*/

            expect(survey_routes.getAll).to.be.an.instanceOf(Function);
            supertest(this.app)
                .get('/api/survey')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));
                    try {
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('survey');
                        expect(res.body.survey).to.be.an.instanceOf(Array);
                        res.body.survey.forEach(survey =>
                            expect(removeNullProperties(survey)).to.be.jsonSchema(survey_schema)
                        );
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public destroy(access_token: AccessTokenType, survey: Survey): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `destroy` must be defined'));
            else if (survey == null)
                return reject(new TypeError('`survey` argument to `destroy` must be defined'));

            expect(survey_route.read).to.be.an.instanceOf(Function);
            supertest(this.app)
                .del(`/api/survey/${new Date(survey.createdAt).toISOString()}`)
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
