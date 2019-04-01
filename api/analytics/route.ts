import * as restify from 'restify';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { JsonSchema } from 'tv4';

import { IOrmReq } from 'orm-mw';
import { IRiskRes } from '../risk_res/models.d';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:id`,
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = req.getOrm().waterline.collections['risk_res_tbl0'];
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
