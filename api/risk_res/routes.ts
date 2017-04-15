import * as restify from 'restify';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError } from 'restify-errors';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';
import { c } from '../../main';
import { IRiskRes } from './models.d';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_body, mk_valid_body_mw_ignore(risk_res_schema, ['createdAt', 'id']),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const RiskRes: Query = c.collections['risk_res_tbl'];

            RiskRes.create(req.body).exec((error: WLError | Error, risk_res: IRiskRes) => {
                if (error) return next(fmtError(error));
                else if (!risk_res) return next(new NotFoundError('RiskRes'));
                res.json(201, risk_res);
                return next();
            });
        }
    );
};
