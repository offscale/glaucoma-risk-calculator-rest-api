import supertest, { Response } from 'supertest';
import * as chai from 'chai';
import { expect } from 'chai';

import { getError, sanitiseSchema, supertestGetError } from '@offscale/nodejs-utils';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

import { User } from '../../../api/user/models';
import { Config } from '../../../api/config/models';
import * as config_routes from '../../../api/config/routes';
import { removeNullProperties } from '../../../utils';

const chaiJsonSchema = require('chai-json-schema');

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const config_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class ConfigTestSDK {
    constructor(public app) {
    }

    public create(access_token: AccessTokenType, config: Config): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null || !access_token.length)
                return reject(new TypeError('`access_token` argument to `create` must be defined'));
            else if (config == null)
                return reject(new TypeError('`config` argument to `create` must be defined'));

            expect(config_routes.create).to.be.an.instanceOf(Function);
            supertest(this.app)
                .post('/api/config')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .send(config)
                .expect('Content-Type', /json/)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(getError(res.error));

                    try {
                        expect(res.status).to.be.above(199);
                        expect(res.status).to.be.below(202);
                        expect(res.body).to.be.an('object');
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(config_schema);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }

    public get(access_token: AccessTokenType, config: Config): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            if (access_token == null)
                return reject(new TypeError('`access_token` argument to `getAll` must be defined'));
            else if (config == null)
                return reject(new TypeError('`config` argument to `getAll` must be defined'));

            expect(config_routes.read).to.be.an.instanceOf(Function);
            supertest(this.app)
                .get('/api/config')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res: Response) => {
                    if (err != null) return reject(supertestGetError(err, res));
                    else if (res.error) return reject(res.error);
                    try {
                        expect(removeNullProperties(res.body)).to.be.jsonSchema(config_schema);
                    } catch (e) {
                        return reject(e as Chai.AssertionError);
                    }
                    return resolve(res);
                });
        });
    }
}
