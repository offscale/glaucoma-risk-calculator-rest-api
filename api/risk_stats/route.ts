import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { fmtError, NotFoundError } from 'restify-errors';
import { JsonSchema } from 'tv4';
import { c } from '../../main';
import { has_auth } from '../auth/middleware';
import { IRiskStats } from './models.d';

/* tslint:disable:no-var-requires */
const risk_stats_schema: JsonSchema = require('./../../test/api/risk_stats/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:createdAt`,
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const RiskStats: Query = c.collections['risk_stats_tbl'];

            const q = req.params.createdAt === 'latest' ?
                RiskStats.find().sort('createdAt DESC')
                    .limit(1) :
                RiskStats.findOne({createdAt: req.params.createdAt});
            q.exec((error: WLError, risk_stats: IRiskStats | IRiskStats[]) => {
                if (error) return next(fmtError(error));
                else if (!risk_stats) return next(new NotFoundError('RiskStats'));
                const stats: IRiskStats = Array.isArray(risk_stats) ? risk_stats[0] : risk_stats;
                if (!stats) return next(new NotFoundError('RiskStats'));
                res.json(stats);
                return next();
            });
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:createdAt`, has_auth(), has_body, mk_valid_body_mw_ignore(risk_stats_schema, ['createdAt']),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const RiskStats: Query = c.collections['risk_stats_tbl'];

            req.body = Object.freeze({risk_json: req.body.risk_json});
            const crit = Object.freeze({createdAt: req.params.createdAt});
            // TODO: Transaction
            async.series({
                count: cb =>
                    RiskStats.count(crit, (err: WLError, count: number) => {
                        if (err) return cb(err);
                        else if (!count) return cb(new NotFoundError('RiskStats'));
                        return cb(null, count);
                    }),
                update: cb => RiskStats.update(crit, req.body).exec((e, risk_stats: IRiskStats[]) =>
                    cb(e, risk_stats[0])
                )
            }, (error, results: { count: number, update: string }) => {
                if (error) return next(fmtError(error));
                res.json(200, results.update);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:createdAt`, has_auth(),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const RiskStats: Query = c.collections['risk_stats_tbl'];

            RiskStats.destroy({createdAt: req.params.createdAt}).exec((error: WLError) => {
                if (error) return next(fmtError(error));
                res.send(204);
                return next();
            });
        }
    );
};
