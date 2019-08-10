import { parallel } from 'async';
import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { resolveIntFromObject } from '@offscale/nodejs-utils'
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { RiskRes } from '../risk_res/models';
import { Survey } from '../survey/models';
import { Between, FindConditions, Repository } from 'typeorm';
// const jStat = require('jstat');

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

interface IMultiSeries {
    name: string;
    series: {name: string, value: number}[];
}

export const getAll = (app: restify.Server, namespace: string = ''): void => {
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

    app.get(namespace, // has_auth('admin'),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            const RiskRes_r = req.getOrm().typeorm!.connection.getRepository(RiskRes);
            const Survey_r = req.getOrm().typeorm!.connection.getRepository(Survey);

            const [
                condition,
                where_condition,
                valuesToEscape,
                criteria
            ] = ((): [string, string, string[], FindConditions<Survey | RiskRes> | undefined] => {
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
            })();

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
