import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { fmtError, NotFoundError } from 'restify-errors';
import { JsonSchema } from 'tv4';
import { c } from '../../main';
import { has_auth } from '../auth/middleware';
import { IRiskRes } from './models.d';


const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export function read(app: restify.Server, namespace: string = ""): void {
    app.get(`${namespace}/:createdAt`,
        function (req: restify.Request, res: restify.Response, next: restify.Next) {
            const RiskRes: Query = c.collections['risk_res_tbl'];

            const q = req.params.createdAt === 'latest' ?
                RiskRes.find().sort('createdAt DESC')
                    .limit(1) :
                RiskRes.findOne({createdAt: req.params.createdAt});
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
}

export function update(app: restify.Server, namespace: string = ""): void {
    app.put(`${namespace}/:createdAt`, has_auth(), has_body, mk_valid_body_mw_ignore(risk_res_schema, ['createdAt']),
        function (req: restify.Request, res: restify.Response, next: restify.Next) {
            const RiskRes: Query = c.collections['risk_res_tbl'];

            //req.body = Object.freeze({risk_json: req.body.risk_json});
            const crit = Object.freeze({createdAt: req.params.createdAt});
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
                return next()
            });
        }
    );
}

export function del(app: restify.Server, namespace: string = ""): void {
    app.del(`${namespace}/:createdAt`, has_auth(),
        function (req: restify.Request, res: restify.Response, next: restify.Next) {
            const RiskRes: Query = c.collections['risk_res_tbl'];

            RiskRes.destroy({createdAt: req.params.createdAt}).exec((error: WLError) => {
                if (error) return next(fmtError(error));
                res.send(204);
                return next();
            });
        }
    );
}
