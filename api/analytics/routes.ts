import { parallel } from 'async';
import * as restify from 'restify';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';
import { resolveIntFromObject } from 'nodejs-utils'
import { IOrmReq } from 'orm-mw';
import * as simpleStatistics from 'simple-statistics';

import { IRiskRes } from '../risk_res/models.d';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_body, mk_valid_body_mw_ignore(risk_res_schema, ['createdAt', 'id']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = req.getOrm().waterline.collections['risk_res_tbl0'];

            RiskRes.create(req.body).exec((error: WLError | Error, risk_res: IRiskRes) => {
                if (error != null) return next(fmtError(error));
                else if (risk_res == null) return next(new NotFoundError('RiskRes'));
                res.json(201, risk_res);
                return next();
            });
        }
    );
};

// const funcs = Object.freeze(['average', 'mean', 'max', 'min']);


const funcs = Object.freeze([
    'min',
    'max',
    'sum',

    'mean',
    'mode',
    'median',
    'harmonicMean',
    'geometricMean',
    'rootMeanSquare',
    'sampleSkewness',

    'variance',
    'sampleVariance',
    'standardDeviation',
    'sampleStandardDeviation',
    'medianAbsoluteDeviation',
    'interquartileRange'
]);

const f = (func: readonly string[], obj: {}): {} =>
    funcs
        .map(func => ({ [func]: simpleStatistics[func](obj) }))
        .reduce((a, b) => Object.assign(a, b), {});

export const getAll = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace,//has_auth('admin'),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = req.getOrm().waterline.collections['risk_res_tbl0'];

            const [condition, where_condition, valuesToEscape] = ((): [string, string, string[]] => {
                if (req.query == null || req.query.startDatetime == null || req.query.endDatetime == null)
                    return ['', '', []];

                req.query.startDatetime = decodeURIComponent(req.query.startDatetime);
                req.query.endDatetime = decodeURIComponent(req.query.endDatetime);

                const r: [string, string, string[]] = [
                    `"createdAt" >= $1 AND "updatedAt" <= $2`, '', [req.query.startDatetime, req.query.endDatetime]
                ];
                r[1] = `WHERE ${r[0]}`;
                return r;
            })();

            parallel({
                row_wise_stats:
                    callb => RiskRes
                        .find(condition ? {
                            where: {
                                createdAt: { '>=': req.query.startDatetime },
                                updatedAt: { '<=': req.query.endDatetime }
                            }
                        } : {})
                        .exec((error: WLError | Error, risk_res: IRiskRes[]) => {
                            if (error != null) return callb(error as Error);
                            else if (risk_res == null || !risk_res.length) return next(new NotFoundError('RiskRes'));

                            return callb(void 0,
                                Object.assign(
                                    // Object.keys(risk_res[0])
                                    {
                                        column: ['age', 'client_risk']
                                            .map(col => ({ [col]: f(funcs, risk_res.map(rr => rr[col])) }))
                                            .reduce((prev, curr) => Object.assign(prev, curr), {})
                                    },
                                    { risk_res }
                                )
                            );
                        }),
                ethnicity_agg:
                    callb => RiskRes.query(
                        `SELECT ethnicity, COUNT(*)
                        FROM risk_res_tbl0
                        ${where_condition} 
                        GROUP BY ethnicity ;`,
                        valuesToEscape, (e, r) => {
                            if (e != null) return next(fmtError(e));
                            else if (r.rows == null || !r.rows.length) return next(new NotFoundError('RiskRes'));
                            return callb(void 0, r.rows.map(el => ({ name: el.ethnicity, value: parseInt(el.count) })));
                        }),
                step_2: callb =>
                    RiskRes.query(`
                    SELECT
                        COUNT(*),
                        COUNT(client_risk) filter (WHERE client_risk <= 25) AS least,
                        COUNT(client_risk) filter (WHERE client_risk > 25 AND client_risk <= 50) AS average,
                        COUNT(client_risk) filter (WHERE client_risk > 50 AND client_risk <= 75) AS high,
                        COUNT(client_risk) filter (WHERE client_risk > 75) AS greatest
                    FROM risk_res_tbl0
                    ${where_condition} ;`, valuesToEscape, (e, r) => {
                        if (e != null) return next(fmtError(e));
                        else if (r.rows == null || !r.rows.length) return next(new NotFoundError('RiskRes'));
                        return callb(void 0, r.rows.map(resolveIntFromObject)[0]);
                    })
            }, (err, results) => {
                if (err != null) return next(fmtError(err));
                res.json(200, results);
                return next();
            });
        }
    );
};
