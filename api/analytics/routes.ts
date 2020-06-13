import { parallel } from 'async';
import * as restify from 'restify';
import { JsonSchema } from 'tv4';
import * as simpleStatistics from 'simple-statistics';
import { ttest } from 'ttest/hypothesis';
import { Between, FindConditions, Repository } from 'typeorm';

import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { resolveIntFromObject } from '@offscale/nodejs-utils'
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { removePropsFromObj } from '../../utils';
import { RiskRes } from '../risk_res/models';
import { Survey } from '../survey/models';
import { StudentT } from 'ttest/hypothesis/one-data-set';

// const jStat = require('jstat');

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_body, mk_valid_body_mw_ignore(risk_res_schema, ['createdAt', 'id']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            req.body = removePropsFromObj(req.body, ['createdAt', 'updatedAt']);

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

// const statistical_functions = Object.freeze(['average', 'mean', 'max', 'min']);

type DeepReadonly<T> =
    T extends any[] ? DeepReadonlyArray<T[number]> :
        T extends object ? DeepReadonlyObject<T> :
            T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = T &
    { readonly [P in keyof T]: DeepReadonly<T[P]> };
/*
// Can't automatically acquire with `func.name`
export const statistical_functions: DeepReadonlyArray<[string, (ns: number[]|{}) => number[]][]> = Object.freeze([
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

export const statistical_functions: DeepReadonlyArray<[string, string]> = Object.freeze([
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

const get_func = (func: DeepReadonlyArray<string>, input: {}): ((a: {}) => number | StudentT) => {
    if (func[1] === 'simpleStatistics')
        return (_: {}) => simpleStatistics[func[0]](input);
    else if (func[1] === 'ttest')
        return (_: {}) => ttest(input as any, {
            mu: 2,
            alpha: 0.05,
            alternative: 'not equal'
        });
    else {
        console.error('`get_func` could not recognise the func:', func, '\twith input:', input, ';');
        return (_: {}): number => -1;
    }
};
/*
    console.info('func', func, ';\n', (
    func[1] === 'simpleStatistics' ? simpleStatistics : ident => ident)[func[0]], ';') as any || input == null? ident => ({ident: 0})
    : ;
*/

const f = (fs: typeof statistical_functions, obj: {}): {} =>
    fs
        .map(func => ({
            [func[0]]:
                get_func(func, obj)(obj)
        }))
        .reduce((a, b) => Object.assign(a, b), {});

export const getAll = (app: restify.Server, namespace: string = ''): void => {
    type TAgg = {[key: string]: number};

    const row_wise_stats = (RiskRes_r: Repository<RiskRes>,
                            criteria?: FindConditions<Survey | RiskRes>): Promise<{}> => new Promise<{}>(
        (resolve, reject) =>
            RiskRes_r
                .find(criteria == null ? void 0 : criteria)
                .then(risk_res => {
                    if (risk_res == null || !risk_res.length) return reject(new NotFoundError('RiskRes'));

                    /*
                    console.info('tukeyhsd:',
                        jStat.tukeyhsd([[1, 2], [3, 4, 5], [6], [7, 8]]), ';');

                     */

                    return resolve(Object.assign(
                        // Object.keys(risk_res[0])
                        {
                            column: ['age', 'client_risk']
                                .map(col => ({
                                        [col]: Object.assign(
                                            f(statistical_functions, risk_res.map(rr =>
                                                /*console.info('col:', col, ';\nrr:', rr, ';') as any ||*/
                                                rr[col]
                                            ))
                                        )
                                        , // Object.assign(f(statistical_functions, risk_res.map(rr => rr[col])),
                                        // { ttest: ttest(risk_res.map(rr => rr[col]), void 0) }
                                    })
                                )
                                .reduce((prev, curr) => Object.assign(prev, curr), {})
                        },
                        { risk_res }
                        )
                    );
                })
                .catch(reject));

    const ethnicity_agg = (RiskRes_r: Repository<RiskRes>,
                           where_condition: string,
                           valuesToEscape: string[]): Promise<TAgg> => new Promise<TAgg>(
        (resolve, reject) =>
            RiskRes_r
                .query(
                    `SELECT ethnicity as name, COUNT(*) as value
                        FROM risk_res_tbl
                        ${where_condition} 
                        GROUP BY ethnicity ;`,
                    valuesToEscape)
                .then(r => {
                    if (r == null) return reject(new NotFoundError('RiskRes'));
                    return resolve(r.map(resolveIntFromObject));
                })
                .catch(reject)
    );

    const step_2 = (RiskRes_r: Repository<RiskRes>,
                    where_condition: string,
                    valuesToEscape: string[]): Promise<TAgg> => new Promise<TAgg>(
        (resolve, reject) => RiskRes_r.query(`
                    SELECT
                        COUNT(*),
                        COUNT(client_risk) filter (WHERE client_risk <= 25) AS least,
                        COUNT(client_risk) filter (WHERE client_risk > 25 AND client_risk <= 50) AS average,
                        COUNT(client_risk) filter (WHERE client_risk > 50 AND client_risk <= 75) AS high,
                        COUNT(client_risk) filter (WHERE client_risk > 75) AS greatest
                    FROM risk_res_tbl
                    ${where_condition} ;`, valuesToEscape)
            .then(r => {
                if (r == null || !r.length) return reject(new NotFoundError('RiskRes'));
                return resolve(resolveIntFromObject(r[0]));
            })
            .catch(reject)
    );

    const step_2_multi_series = (RiskRes_r: Repository<RiskRes>,
                                 where_condition: string,
                                 valuesToEscape: string[]): Promise<IMultiSeries[]> => new Promise<IMultiSeries[]>(
        (resolve, reject) => {
            const tiers = ['lowest', 'low', 'med', 'high'];

            RiskRes_r.query(`
                    SELECT *, (array${JSON.stringify(tiers)
                .replace(/ /g, '')
                .replace(/"/g, '\'')
            })[ceil(greatest(client_risk,1) / 25.0)] AS mag
                    FROM risk_res_tbl
                    ${where_condition} 
                    ORDER BY client_risk;`, valuesToEscape)
                .then(r => {
                    if (r == null || !r.length) return reject(new NotFoundError('RiskRes'));
                    const multi_series_m = new Map<string, {name: string, value: number}[]>();
                    tiers.forEach(tier => multi_series_m.set(tier, []));
                    r
                        .map(resolveIntFromObject)
                        .forEach((row: RiskRes & {mag: string}) => {
                            multi_series_m
                                .get(row.mag)!
                                .push({
                                    name: row.id.toString(),
                                    value: row.client_risk as number
                                })
                        });
                    const multi_series: IMultiSeries[] = [];
                    tiers.forEach(tier =>
                        multi_series.push({
                            name: tier,
                            series: multi_series_m.get(tier)!
                        })
                    );

                    return resolve(multi_series);
                })
                .catch(reject);
        });

    const survey_tbl = (Survey_r: Repository<Survey>,
                        criteria?: FindConditions<Survey>): Promise<Survey> => new Promise<Survey>(
        (resolve, reject) => console.info('survey_tbl::criteria:', criteria, ';') as any || (
            criteria == null ?
                Survey_r.findOneOrFail({
                    order: {
                        createdAt: 'DESC'
                    }
                })
                : Survey_r
                    .findOneOrFail(criteria)
        )
            .then(resolve)
            .catch(reject));

    const joint = (Survey_r: Repository<Survey>,
                   where_condition: string,
                   valuesToEscape: string[]): Promise<Array<Survey | RiskRes>> => new Promise<Array<Survey | RiskRes>>(
        (resolve, reject) =>
            Survey_r.query(`
                    SELECT r.age, r.client_risk, r.gender, r.ethnicity, r.other_info, r.email, r.sibling, r.parent,
                           r.study, r.myopia, r.diabetes, r.id AS risk_id, r."createdAt", r."updatedAt",
                           s.perceived_risk, s.recruiter, s.eye_test_frequency, s.glasses_use, s.behaviour_change,
                           s.risk_res_id, s.id, s."createdAt", s."updatedAt"
                    FROM survey_tbl s
                    FULL JOIN risk_res_tbl r
                    ON s.risk_res_id = r.id
                    ${where_condition.replace(/ "/g, ' s."')} ;`, valuesToEscape)
                .then(r => {
                    if (r == null || !r.length) return reject(new NotFoundError('RiskRes'));
                    const joint = r.map(resolveIntFromObject);
                    console.info('getAll::joint::ttest:', JSON.stringify(ttest([1, 2, 2, 2, 4], {
                        mu: 2,
                        alpha: 0.05,
                        alternative: 'not equal'
                    })), ';');
                    return resolve(joint);
                })
                .catch(reject)
    );

    const parse_request =
        (req: restify.Request): [string, string, string[], FindConditions<Survey | RiskRes> | undefined] => {
            if (req.query == null || req.query.startDatetime == null || req.query.endDatetime == null)
                return ['', '', [], void 0];

            req.query.startDatetime = decodeURIComponent(req.query.startDatetime);
            req.query.endDatetime = decodeURIComponent(req.query.endDatetime);

            const r: [string, string, string[], FindConditions<Survey | RiskRes> | undefined] = [
                `"createdAt" BETWEEN $1 AND $2`,
                '',
                [req.query.startDatetime, req.query.endDatetime],
                {
                    createdAt: Between(req.query.startDatetime, req.query.endDatetime)
                }
            ];
            r[1] = `WHERE ${r[0]}`;

            return r;
        };

    app.get(`${namespace}0`, // has_auth('admin'),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            const RiskRes_r = req.getOrm().typeorm!.connection
                .getRepository<RiskRes>(RiskRes) as unknown as Repository<RiskRes>;
            const Survey_r = req.getOrm().typeorm!.connection
                .getRepository(Survey) as unknown as Repository<Survey>;

            const [condition, where_condition, valuesToEscape, criteria] = parse_request(req);

            parallel({
                row_wise_stats: callb =>
                    row_wise_stats(RiskRes_r, criteria)
                        .then(row_wise => callb(void 0, row_wise))
                        .catch(callb),
                ethnicity_agg: callb =>
                    ethnicity_agg(RiskRes_r, where_condition, valuesToEscape)
                        .then(aggs => callb(void 0, aggs))
                        .catch(callb),
                step_2: callb =>
                    step_2(RiskRes_r, where_condition, valuesToEscape)
                        .then(s2 => callb(void 0, s2))
                        .catch(callb),
                survey_tbl: callb =>
                    survey_tbl(Survey_r)
                        .then(survey => callb(void 0, survey))
                        .catch(callb),
                joint: callb =>
                    joint(Survey_r, where_condition, valuesToEscape)
                        .then(aggs => callb(void 0, aggs))
                        .catch(callb)
            }, (err, results) => {
                if (err != null) return next(fmtError(err));
                const response = Buffer.from(JSON.stringify(results), 'utf8');
                res.charSet('utf-8');
                res.contentType = 'json';
                res.set({
                    'content-type': 'application/json'
                });
                res.header('Content-Length', response.byteLength);
                res.sendRaw(response);
                return next();
            });
        }
    );

    app.get(`${namespace}1`, // has_auth('admin'),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            const RiskRes_r = req.getOrm().typeorm!.connection.getRepository(RiskRes) as unknown as Repository<RiskRes>;
            const Survey_r = req.getOrm().typeorm!.connection.getRepository(Survey) as unknown as Repository<Survey>;

            const [condition, where_condition, valuesToEscape, criteria] = parse_request(req);

            parallel({
                step_2_multi_series: callb =>
                    step_2_multi_series(RiskRes_r, where_condition, valuesToEscape)
                        .then(s2_multi_series => callb(void 0, s2_multi_series))
                        .catch(callb),
            }, (err, results) => {
                if (err != null) return next(fmtError(err));
                const response = Buffer.from(JSON.stringify(results), 'utf8');
                res.charSet('utf-8');
                res.contentType = 'json';
                res.set({
                    'content-type': 'application/json'
                });
                res.header('Content-Length', response.byteLength);
                res.sendRaw(response);
                return next();
            });
        }
    );
};

interface IMultiSeries {
    name: string;
    series: {name: string, value: number}[];
}
