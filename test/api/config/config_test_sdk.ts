import * as supertest from 'supertest';
import { Response } from 'supertest';
import * as chai from 'chai';
import { expect } from 'chai';
import { getError, IncomingMessageError, sanitiseSchema, superEndCb } from 'nodejs-utils';
import * as chaiJsonSchema from 'chai-json-schema';

import { IConfigBase } from '../../../api/config/models.d';
import { User } from '../../../api/user/models';
import { TCallback } from '../../shared_types';

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const config_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class ConfigTestSDK {
    constructor(public app) {
    }

    public create(access_token: string, config: IConfigBase,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `create` must be defined'));
        else if (config == null)
            return callback(new TypeError('`config` argument to `create` must be defined'));

        supertest(this.app)
            .post('/api/config')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(config)
            .expect('Content-Type', /json/)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err, res);
                else if (res.error) return callback(getError(res.error));

                try {
                    expect(res.status).to.be.above(199);
                    expect(res.status).to.be.below(202);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(config_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public get(access_token: string, config: IConfigBase,
               callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (config == null)
            return callback(new TypeError('`config` argument to `getAll` must be defined'));

        supertest(this.app)
            .get('/api/config')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err, res);
                else if (res.error) return callback(res.error);
                try {
                    expect(res.body).to.be.jsonSchema(config_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }
}
