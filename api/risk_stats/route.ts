import * as restify from 'restify';
import * as async from 'async';
import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { JsonSchema } from 'tv4';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { RiskStats } from './models';

/* tslint:disable:no-var-requires */
const risk_stats_schema: JsonSchema = require('./../../test/api/risk_stats/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:createdAt`,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskStats_r = req.getOrm().typeorm!.connection.getRepository(RiskStats);

            const q: Promise<RiskStats | undefined> = req.params.id === 'latest'
                ? RiskStats_r
                    .createQueryBuilder('risk_stats')
                    .addOrderBy('risk_stats.createdAt', 'DESC')
                    .getOne()
                : RiskStats_r.findOneOrFail({ createdAt: req.params.createdAt });

            q
                .then((risk_stats?: RiskStats) => {
                    if (risk_stats == null) return next(new NotFoundError('RiskStats'));
                    res.json(risk_stats);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:createdAt`, has_auth(), has_body, mk_valid_body_mw_ignore(risk_stats_schema, ['createdAt']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskStats_r = req.getOrm().typeorm!.connection.getRepository(RiskStats);

            req.body = Object.freeze({ risk_json: req.body.risk_json });
            const crit = Object.freeze({ createdAt: req.params.createdAt });
            // TODO: Transaction
            async.series({
                count: cb =>
                    RiskStats_r
                        .count(crit)
                        .then((count: number) => {
                            if (!count) return cb(new NotFoundError('RiskStats'));
                            return cb(null, count);
                        })
                        .catch(cb),
                update: cb => RiskStats_r
                    .update(crit, req.body)
                    .then((risk_stats: RiskStats[]) => cb(void 0, risk_stats[0]))
                    .catch(cb)
            }, (error, results: {count: number, update: string}) => {
                if (error != null) return next(fmtError(error));
                res.json(200, results.update);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:createdAt`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            req.getOrm().typeorm!.connection.getRepository(RiskStats)
                .delete({ createdAt: req.params.createdAt })
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
