import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { has_body, mk_valid_body_mw } from 'restify-validators';
import { fmtError, NotFoundError } from 'restify-errors';
import { JsonSchema } from 'tv4';
import { c } from '../../main';
import { has_auth } from '../auth/middleware';
import { IRiskRes } from './models.d';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:id`,
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = c.collections['risk_res_tbl'];
            const q = req.params.id === 'latest' ?
                RiskRes.find().sort('createdAt DESC').limit(1)
                : RiskRes.findOne({createdAt: req.params.id});
            q.exec((error: WLError, risk_res: IRiskRes | IRiskRes[]) => {
                if (error) return next(fmtError(error));
                else if (!risk_res) return next(new NotFoundError('RiskRes'));
                const stats: IRiskRes = Array.isArray(risk_res) ? risk_res[0] : risk_res;
                if (!stats) return next(new NotFoundError('RiskRes'));
                res.json(stats);
                return next();
            });
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:id`, has_body, mk_valid_body_mw(risk_res_schema),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = c.collections['risk_res_tbl'];

            const crit = Object.freeze({id: req.params.id});
            // TODO: Transaction
            async.series({
                count: cb =>
                    RiskRes.count(crit, (err: WLError, count: number) => {
                        if (err) return cb(err);
                        else if (!count) return cb(new NotFoundError('RiskRes'));
                        return cb(null, count);
                    }),
                update: cb => RiskRes.update(crit, req.body).exec((e, risk_res: IRiskRes[]) =>
                    cb(e, risk_res[0])
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
    app.del(`${namespace}/:id`, has_auth(),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = c.collections['risk_res_tbl'];

            RiskRes.destroy({createdAt: req.params.id}).exec((error: WLError) => {
                if (error) return next(fmtError(error));
                res.send(204);
                return next();
            });
        }
    );
};
