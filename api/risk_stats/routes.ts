import * as restify from 'restify';

import { fmtError, NotFoundError } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';
import { Query, WLError } from 'waterline';

import { has_auth } from '../auth/middleware';
import { IRiskStats } from './models.d';

/* tslint:disable:no-var-requires */
const risk_stats_schema: JsonSchema = require('./../../test/api/risk_stats/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(risk_stats_schema, ['createdAt']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const RiskStats: Query = req.getOrm().waterline.collections['risk_stats_tbl'];

            RiskStats.create(req.body).exec((error: WLError | Error, risk_stats: IRiskStats) => {
                if (error != null) return next(fmtError(error));
                else if (risk_stats == null) return next(new NotFoundError('RiskStats'));
                res.json(201, risk_stats);
                return next();
            });
        }
    );
};
