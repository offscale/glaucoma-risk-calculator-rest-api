import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { has_body, mk_valid_body_mw } from 'restify-validators';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { JsonSchema } from 'tv4';

import { has_auth } from '../auth/middleware';
import { IRiskRes } from './models.d';
import { IOrmReq } from 'orm-mw';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:id`,
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = req.getOrm().waterline.collections['risk_res_tbl'];
            const q = req.params.id === 'latest' ?
                RiskRes.find().sort('createdAt DESC').limit(1)
                : RiskRes.findOne({ id: req.params.id });
            q.exec((error: WLError, risk_res: IRiskRes | IRiskRes[]) => {
                if (error != null) return next(fmtError(error));
                else if (risk_res == null) return next(new NotFoundError('RiskRes'));
                const stats: IRiskRes = Array.isArray(risk_res) ? risk_res[0] : risk_res;
                if (stats == null) return next(new NotFoundError('RiskRes'));
                res.json(stats);
                return next();
            });
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:id`, has_body, mk_valid_body_mw(risk_res_schema),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = req.getOrm().waterline.collections['risk_res_tbl'];

            const crit = Object.freeze({ id: req.params.id });
            // TODO: Transaction
            async.series({
                count: cb =>
                    RiskRes.count(crit, (err: WLError | Error, count: number) => {
                        if (err != null) return cb(err as any as Error);
                        else if (!count) return cb(new NotFoundError('RiskRes'));
                        return cb(null, count);
                    }),
                update: cb => RiskRes.update(crit, req.body).exec((e, risk_res: IRiskRes[]) =>
                    cb(e, risk_res[0])
                )
            }, (error, results: {count: number, update: string}) => {
                if (error != null) return next(fmtError(error));
                res.json(200, results.update);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:id`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = req.getOrm().waterline.collections['risk_res_tbl'];

            RiskRes.destroy({ createdAt: req.params.id }).exec((error: WLError) => {
                if (error != null) return next(fmtError(error));
                res.send(204);
                return next();
            });
        }
    );
};
