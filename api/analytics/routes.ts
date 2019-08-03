import { parallel } from 'async';
import * as restify from 'restify';
import { JsonSchema } from 'tv4';
import * as simpleStatistics from 'simple-statistics';
import { ttest } from 'ttest/hypothesis';

import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { resolveIntFromObject } from '@offscale/nodejs-utils'
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { RiskRes } from '../risk_res/models';
import { Survey } from '../survey/models';
// const jStat = require('jstat');

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_body, mk_valid_body_mw_ignore(risk_res_schema, ['createdAt', 'id']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            const risk_res = new RiskRes();
            Object.keys(req.body).forEach(k => risk_res[k] = req.body[k]);

            req.getOrm().typeorm!.connection
                .getRepository(RiskRes)
                .save(risk_res)
                .then((entity) => {
                    if (entity == null) return next(new NotFoundError('RiskRes'));
                    res.json(201, entity);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

// const funcs = Object.freeze(['average', 'mean', 'max', 'min']);

type DeepReadonly<T> =
    T extends any[] ? DeepReadonlyArray<T[number]> :
        T extends object ? DeepReadonlyObject<T> :
            T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = T &
    { readonly [P in keyof T]: DeepReadonly<T[P]> };
/*
// Can't automatically acquire with `func.name`
export const funcs: DeepReadonlyArray<[string, (ns: number[]|{}) => number[]][]> = Object.freeze([
    ['min', simpleStatistics.min],
    ['max', simpleStatistics.max],
    ['sum', simpleStatistics.sum],

    ['mean', simpleStatistics.mean],
    ['mode', simpleStatistics.mode],
    ['median', simpleStatistics.median],
    ['harmonicMean', simpleStatistics.harmonicMean],
    ['geometricMean', simpleStatistics.geometricMean],
    ['rootMeanSquare', simpleStatistics.rootMeanSquare],
    ['sampleSkewness', simpleStatistics.sampleSkewness],

    ['variance', simpleStatistics.variance],
    ['sampleVariance', simpleStatistics.sampleVariance],
    ['standardDeviation', simpleStatistics.standardDeviation],
    ['sampleStandardDeviation', simpleStatistics.sampleStandardDeviation],
    ['medianAbsoluteDeviation', simpleStatistics.medianAbsoluteDeviation],
    ['interquartileRange', simpleStatistics.interquartileRange],

    ['tukeyhsd', jStat.tukeyhsd]
]);

const f = (fs: DeepReadonlyArray<[string, (ns: number[]|{}) => number[]][]>, obj: {}): {} =>
    fs
        .map(func => ({ [func[0] as any as string]: (func[1] as any as (ns: number[]|{}) => number[])(obj) }))
        .reduce((a, b) => Object.assign(a, b), {});
*/

export const funcs: DeepReadonlyArray<[string, string]> = Object.freeze([
    ['min', 'simpleStatistics'],
    ['max', 'simpleStatistics'],
    ['sum', 'simpleStatistics'],

    ['mean', 'simpleStatistics'],
    ['mode', 'simpleStatistics'],
    ['median', 'simpleStatistics'],
    ['harmonicMean', 'simpleStatistics'],
    ['geometricMean', 'simpleStatistics'],
    ['rootMeanSquare', 'simpleStatistics'],
    ['sampleSkewness', 'simpleStatistics'],

    ['variance', 'simpleStatistics'],
    ['sampleVariance', 'simpleStatistics'],
    ['standardDeviation', 'simpleStatistics'],
    ['sampleStandardDeviation', 'simpleStatistics'],
    ['medianAbsoluteDeviation', 'simpleStatistics'],
    ['interquartileRange', 'simpleStatistics'],

    ['ttest', 'ttest']

    // ['tukeyhsd', 'jStat']
]);

const get_func = (func: DeepReadonlyArray<string>, input: {}): ((a: {}) => number) => {
    console.info('func:', func, ';\ninput:', input, ';');
    return (b: {}): number => 5;
};
/*
    console.info('func', func, ';\n', (
    func[1] === 'simpleStatistics' ? simpleStatistics : ident => ident)[func[0]], ';') as any || input == null? ident => ({ident: 0})
    : ;
*/

const f = (fs: typeof funcs, obj: {}): {} =>
    fs
        .map(func => ({
            [func[0]]:
                get_func(func, obj)(obj)
        }))
        .reduce((a, b) => Object.assign(a, b), {});

export const getAll = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace,//has_auth('admin'),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            const RiskRes_r = req.getOrm().typeorm!.connection.getRepository(RiskRes);
            const Survey_r = req.getOrm().typeorm!.connection.getRepository(Survey);

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
                    callb => RiskRes_r
                        .find(condition ? {
                            where: {
                                createdAt: { '>=': req.query.startDatetime },
                                updatedAt: { '<=': req.query.endDatetime }
                            }
                        } : {})
                        .then(risk_res => {
                            if (risk_res == null || !risk_res.length) return next(new NotFoundError('RiskRes'));

                            /*
                            console.info('tukeyhsd:',
                                jStat.tukeyhsd([[1, 2], [3, 4, 5], [6], [7, 8]]), ';');

                             */

                            return callb(void 0,
                                Object.assign(
                                    // Object.keys(risk_res[0])
                                    {
                                        column: ['age', 'client_risk']
                                            .map(col => ({
                                                    [col]: Object.assign(
                                                        f(funcs, risk_res.map(rr => console.info('col:', col, ';\nrr:', rr, ';') as any || rr[col]))
                                                    )
                                                    , // Object.assign(f(funcs, risk_res.map(rr => rr[col])),
                                                    // { ttest: ttest(risk_res.map(rr => rr[col]), void 0) }
                                                })
                                            )
                                            .reduce((prev, curr) => Object.assign(prev, curr), {})
                                    },
                                    { risk_res }
                                )
                            );
                        })
                        .catch(callb),
                ethnicity_agg:
                    callb => RiskRes_r
                        .query(
                            `SELECT ethnicity, COUNT(*)
                        FROM risk_res_tbl0
                        ${where_condition} 
                        GROUP BY ethnicity ;`,
                            valuesToEscape)
                        .then(r => {
                            if (r == null) return next(new NotFoundError('RiskRes'));
                            return callb(
                                void 0, r.rows.map(el => ({ name: el.ethnicity, value: parseInt(el.count) }))
                            );
                        })
                        .catch(callb),
                step_2: callb =>
                    RiskRes_r.query(`
                    SELECT
                        COUNT(*),
                        COUNT(client_risk) filter (WHERE client_risk <= 25) AS least,
                        COUNT(client_risk) filter (WHERE client_risk > 25 AND client_risk <= 50) AS average,
                        COUNT(client_risk) filter (WHERE client_risk > 50 AND client_risk <= 75) AS high,
                        COUNT(client_risk) filter (WHERE client_risk > 75) AS greatest
                    FROM risk_res_tbl0
                    ${where_condition} ;`, valuesToEscape)
                        .then(r => {
                            if (r.rows == null || !r.rows.length) return next(new NotFoundError('RiskRes'));
                            return callb(void 0, r.rows.map(resolveIntFromObject)[0]);
                        })
                        .catch(callb),
                survey_tbl: callb => Survey_r
                    .find(condition ? {
                        where: {
                            createdAt: { '>=': req.query.startDatetime },
                            updatedAt: { '<=': req.query.endDatetime }
                        }
                    } : {})
                    .then(survey => {
                        if (survey == null || !survey.length) return next(new NotFoundError('Survey'));

                        return callb(void 0, survey);
                    })
                    .catch(callb),
                joint: callb => Survey_r.query(`
                    SELECT r.age, r.client_risk, r.gender, r.ethnicity, r.other_info, r.email, r.sibling, r.parent,
                           r.study, r.myopia, r.diabetes, r.id AS risk_id, r."createdAt", r."updatedAt",
                           s.perceived_risk, s.recruiter, s.eye_test_frequency, s.glasses_use, s.behaviour_change,
                           s.risk_res_id, s.id, s."createdAt", s."updatedAt"
                    FROM survey_tbl s
                    FULL JOIN risk_res_tbl0 r
                    ON s.risk_res_id = r.id
                    ${where_condition.replace(/ "/g, ' s."')} ;`, valuesToEscape)
                    .then(r => {
                        if (r.rows == null || !r.rows.length) return next(new NotFoundError('RiskRes'));
                        const joint = r.rows.map(resolveIntFromObject);
                        console.info('ttest:', ttest([1, 2, 2, 2, 4], {
                            mu: 2,
                            alpha: 0.05,
                            alternative: 'not equal'
                        }), ';');
                        return callb(void 0, joint);
                    })
                    .catch(callb)
            }, (err, results) => {
                if (err != null) return next(fmtError(err));
                res.json(results);
                return next();
            });
        }
    );
};
