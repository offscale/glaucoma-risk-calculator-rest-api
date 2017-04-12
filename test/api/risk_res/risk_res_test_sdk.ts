import * as supertest from 'supertest';
import { Response } from 'supertest';
import * as chai from 'chai';
import { expect } from 'chai';
import { sanitiseSchema } from 'nodejs-utils';
import { fmtError } from 'restify-errors';
import * as chaiJsonSchema from 'chai-json-schema';
import { cb } from '../../share_interfaces.d';
import { IRiskResBase } from '../../../api/risk_res/models.d';
import { User } from '../../../api/user/models';

/* tslint:disable:no-var-requires */
const user_schema = sanitiseSchema(require('./../user/schema.json'), User._omit);
const risk_res_schema = require('./schema.json');

chai.use(chaiJsonSchema);

export class RiskResTestSDK {
    constructor(public app) {
    }

    public create(access_token: string, risk_res: IRiskResBase, cb: cb) {
        if (!access_token) return cb(new TypeError('`access_token` argument to `create` must be defined'));
        else if (!risk_res) return cb(new TypeError('`risk_res` argument to `create` must be defined'));

        supertest(this.app)
            .post('/api/risk_res')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(risk_res)
            .expect('Content-Type', /json/)
            .end((err, res: Response) => {
                if (err) return cb(err);
                else if (res.error) return cb(fmtError(res.error));

                try {
                    expect(res.status).to.be.equal(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(risk_res_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    cb(err, res);
                }
            });
    }

    public get(access_token: string, risk_res: IRiskResBase, cb: cb) {
        if (!access_token) return cb(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (!risk_res) return cb(new TypeError('`risk_res` argument to `getAll` must be defined'));
        /*else if (isNaN(risk_res.createdAt as any))
         return cb(new TypeError(`\`risk_res.createdAt\` must not be NaN in \`getAll\` ${risk_res.createdAt}`));*/

        supertest(this.app)
            .get(`/api/risk_res/${risk_res.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res: Response) => {
                if (err) return cb(err);
                else if (res.error) return cb(res.error);
                try {
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.be.jsonSchema(risk_res_schema);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    cb(err, res);
                }
            });
    }

    public destroy(access_token: string, risk_res: IRiskResBase, cb: cb) {
        if (!access_token) return cb(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (!risk_res) return cb(new TypeError('`risk_res` argument to `destroy` must be defined'));

        supertest(this.app)
            .del(`/api/risk_res/${risk_res.createdAt}`)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .end((err, res: Response) => {
                if (err) return cb(err);
                else if (res.error) return cb(res.error);
                try {
                    expect(res.status).to.be.equal(204);
                } catch (e) {
                    err = e as Chai.AssertionError;
                } finally {
                    cb(err, res);
                }
            });
    }
}
