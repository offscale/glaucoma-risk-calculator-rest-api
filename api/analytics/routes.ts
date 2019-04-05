import * as restify from 'restify';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';
import { IOrmReq } from 'orm-mw';
import { IRiskRes } from '../risk_res/models.d';
import { parallel } from 'async';

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

export const getAll = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace,//has_auth('admin'),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = req.getOrm().waterline.collections['risk_res_tbl0'];

            const [condition, valuesToEscape] = ((): [string, string[]] => {
                if (req.query == null || req.query.startDatetime == null || req.query.endDatetime == null)
                    return ['', []];

                req.query.startDatetime = decodeURIComponent(req.query.startDatetime);
                req.query.endDatetime = decodeURIComponent(req.query.endDatetime);
                return [`"createdAt" >= $1 AND "updatedAt" <= $2`, [req.query.startDatetime, req.query.endDatetime]];
            })();

            parallel({
                risk_res:
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
                            return callb(void 0, risk_res);
                        }),
                ethnicity_agg:
                    callb => RiskRes.query(
                        `SELECT ethnicity, COUNT(*)
                        FROM risk_res_tbl0
                        ${condition ? 'WHERE ' + condition : ''} 
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
                    ${condition ? 'WHERE ' + condition : ''} ;`, valuesToEscape, (e, r) => {
                        if (e != null) return next(fmtError(e));
                        else if (r.rows == null || !r.rows.length) return next(new NotFoundError('RiskRes'));
                        return callb(void 0, r.rows.map(row =>
                            Object.keys(row)
                                .map(k => ({ [k]: isNaN(row[k]) ? row[k] : parseInt(row[k]) }))
                                .reduce((a, b) => Object.assign(a, b), {})
                         )[0]);
                    })
            }, (err, results) => {
                if (err != null) return next(fmtError(err));
                res.json(200, results);
                return next();
            });
        }
    );
};
