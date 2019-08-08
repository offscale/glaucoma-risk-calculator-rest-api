import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { RiskStats } from './models';
import { emptyTypeOrmResponse } from '../../utils';
import { isISODateString } from '../template/utils';

/* tslint:disable:no-var-requires */
const risk_stats_schema: JsonSchema = require('./../../test/api/risk_stats/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:createdAt`,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskStats_r = req.getOrm().typeorm!.connection.getRepository(RiskStats);

            const q: Promise<RiskStats> =
                req.params.createdAt === 'latest' ?
                    RiskStats_r
                        .findOneOrFail(
                            {
                                order: {
                                    createdAt: 'DESC'
                                }
                            }) :
                    RiskStats_r
                        .findOneOrFail(isISODateString(req.params.createdAt) ?
                            { createdAt: req.params.createdAt }
                            :/* id */req.params.createdAt
                        );

            q
                .then(risk_stats => {
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
            const crit = { createdAt: req.params.createdAt };

            const risk_stats = new RiskStats();
            Object.keys(req.body).forEach(k => risk_stats[k] = req.body[k]);

            RiskStats_r
                .createQueryBuilder()
                .update()
                .set(risk_stats)
                .where(Object.freeze(crit))
                .execute()
                .then(result => {
                    res.json(emptyTypeOrmResponse(result) ? Object.assign({}, req.body, crit) : result);
                    return next();
                })
                .catch(error => next(fmtError(error)));
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
