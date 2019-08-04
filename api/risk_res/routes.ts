import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';

import { has_auth } from '../auth/middleware';
import { RiskRes } from './models';
import { removePropsFromObj } from '../../utils';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_body, mk_valid_body_mw_ignore(risk_res_schema, ['createdAt', 'id']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskRes_r = req.getOrm().typeorm!.connection.getRepository(RiskRes);

            req.body = removePropsFromObj(req.body, ['createdAt', 'updatedAt', 'id']);
            const risk_res = new RiskRes();
            Object.keys(req.body).forEach(k => risk_res[k] = req.body[k]);

            RiskRes_r
                .save(risk_res)
                .then(risk_res => {
                    if (risk_res == null) return next(new NotFoundError('RiskRes'));
                    res.json(201, risk_res);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const getAll = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace, has_auth('admin'),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskRes_r = req.getOrm().typeorm!.connection.getRepository(RiskRes);

            RiskRes_r
                .find()
                .then((risk_res: RiskRes[]) => {
                    if (risk_res == null || !risk_res.length) return next(new NotFoundError('RiskRes'));

                    RiskRes_r
                        .query(`SELECT ethnicity, COUNT(*) FROM risk_res_tbl GROUP BY ethnicity;`, [])
                        .then(r => {
                            res.json({ risk_res, ethnicity_agg: r.rows });
                            return next();
                        })
                        .catch(e => next(fmtError(e)));
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
