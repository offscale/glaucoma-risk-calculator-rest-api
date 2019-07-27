import * as restify from 'restify';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { JsonSchema } from 'tv4';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { IRiskRes } from './models.d';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_body, mk_valid_body_mw_ignore(risk_res_schema, ['createdAt', 'id']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskRes: Query = req.getOrm().waterline!.collections!['risk_res_tbl0'];

            RiskRes.create(req.body).exec((error: WLError | Error, risk_res: IRiskRes) => {
                if (error != null) return next(fmtError(error));
                else if (risk_res == null) return next(new NotFoundError('RiskRes'));
                res.json(201, risk_res);
                return next();
            });
        }
    );
};

export const getAll = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace, has_auth('admin'),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskRes: Query = req.getOrm().waterline!.collections!['risk_res_tbl0'];

            RiskRes.find().exec((error: WLError | Error, risk_res: IRiskRes[]) => {
                if (error != null) return next(fmtError(error));
                else if (risk_res == null || !risk_res.length) return next(new NotFoundError('RiskRes'));

                RiskRes.query(`SELECT ethnicity, COUNT(*) FROM risk_res_tbl0 GROUP BY ethnicity;`, [], (e, r) => {
                    if (e != null) return next(fmtError(e));
                    res.json({ risk_res, ethnicity_agg: r.rows });
                    return next();
                });
            });
        }
    );
};
