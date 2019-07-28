import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';

import { has_auth } from '../auth/middleware';
import { RiskStats } from './models';

/* tslint:disable:no-var-requires */
const risk_stats_schema: JsonSchema = require('./../../test/api/risk_stats/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(risk_stats_schema, ['createdAt']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskStats_r = req.getOrm().typeorm!.connection.getRepository(RiskStats);

            const risk_stats = new RiskStats();
            Object.keys(req.body).forEach(k => risk_stats[k] = req.body[k]);

            RiskStats_r
                .save(risk_stats)
                .then((risk_stats: RiskStats) => {
                    if (risk_stats == null) return next(new NotFoundError('RiskStats'));
                    res.json(201, risk_stats);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
