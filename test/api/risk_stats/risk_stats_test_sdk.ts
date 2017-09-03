import * as supertest from 'supertest';
import { Response } from 'supertest';
import * as chai from 'chai';
import { expect } from 'chai';
import { getError, IncomingMessageError, sanitiseSchema, superEndCb } from 'nodejs-utils';
import * as chaiJsonSchema from 'chai-json-schema';

import { IRiskStatsBase } from '../../../api/risk_stats/models.d';
import { User } from '../../../api/user/models';
import { TCallback } from '../../shared_types';

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const risk_stats_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class RiskStatsTestSDK {
    constructor(public app) {
    }

    public create(access_token: string, risk_stats: IRiskStatsBase,
                  callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `create` must be defined'));
        else if (risk_stats == null)
            return callback(new TypeError('`risk_stats` argument to `create` must be defined'));

        supertest(this.app)
            .post('/api/risk_stats')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(risk_stats)
            .expect('Content-Type', /json/)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err, res);
                else if (res.error) return callback(getError(res.error));

                try {
                    expect(res.status).to.be.equal(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(risk_stats_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public get(access_token: string, risk_stats: IRiskStatsBase,
               callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (risk_stats == null)
            return callback(new TypeError('`risk_stats` argument to `getAll` must be defined'));

        supertest(this.app)
            .get(`/api/risk_stats/${risk_stats.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err, res);
                else if (res.error) return callback(res.error);
                try {
                    expect(res.body).to.have.property('risk_json');
                    expect(res.body.risk_json).to.be.a('string');
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public update(access_token: string, initial_risk_stats: IRiskStatsBase,
                  updated_risk_stats: IRiskStatsBase, callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `update` must be defined'));
        else if (initial_risk_stats == null)
            return callback(new TypeError('`initial_risk_stats` argument to `update` must be defined'));
        else if (updated_risk_stats == null)
            return callback(new TypeError('`updated_risk_stats` argument to `update` must be defined'));
        else if (initial_risk_stats.createdAt !== updated_risk_stats.createdAt)
            return callback(new ReferenceError(`${initial_risk_stats.createdAt} != ${updated_risk_stats.createdAt}
                 (\`createdAt\`s between risk_stats')`)
            );

        supertest(this.app)
            .put(`/api/risk_stats/${initial_risk_stats.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(updated_risk_stats)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err, res);
                else if (res.error) return callback(getError(res.error));
                try {
                    expect(res.body).to.be.an('object');
                    Object.keys(updated_risk_stats).map(
                        attr => expect(updated_risk_stats[attr]).to.be.equal(res.body[attr])
                    );
                    expect(res.body).to.be.jsonSchema(risk_stats_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    callback(err, res);
                }
            });
    }

    public destroy(access_token: string, risk_stats: IRiskStatsBase,
                   callback: TCallback<Error | IncomingMessageError, Response>) {
        if (access_token == null)
            return callback(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (risk_stats == null)
            return callback(new TypeError('`risk_stats` argument to `destroy` must be defined'));

        supertest(this.app)
            .del(`/api/risk_stats/${risk_stats.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .end((err, res: Response) => {
                if (err != null) return superEndCb(callback)(err, res);
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
