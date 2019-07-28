import * as restify from 'restify';
import * as async from 'async';
import { JsonSchema } from 'tv4';

import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { has_body, mk_valid_body_mw } from '@offscale/restify-validators';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';

import { has_auth } from '../auth/middleware';
import { RiskRes } from './models';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:id`,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskRes_r = req.getOrm().typeorm!.connection.getRepository(RiskRes);
            const q: Promise<RiskRes | undefined> = req.params.id === 'latest'
                ? RiskRes_r
                    .createQueryBuilder('risk_res')
                    .addOrderBy('risk_res.createdAt', 'DESC')
                    .getOne()
                : RiskRes_r.findOneOrFail(req.params.id);
            q
                .then(risk_res => {
                    if (risk_res == null) return next(new NotFoundError('RiskRes'));
                    risk_res = Array.isArray(risk_res) ? risk_res[0] : risk_res;
                    if (risk_res == null) return next(new NotFoundError('RiskRes'));
                    res.json(risk_res);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:id`, has_body, mk_valid_body_mw(risk_res_schema),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskRes_r = req.getOrm().typeorm!.connection.getRepository(RiskRes);

            const crit = Object.freeze({ id: req.params.id });
            // TODO: Transaction
            async.series({
                count: cb =>
                    RiskRes_r
                        .count(crit.id)
                        .then((count: number) => {
                            if (!count) return cb(new NotFoundError('RiskRes'));
                            return cb(void 0, count);
                        })
                        .catch(cb),
                update: cb => RiskRes_r
                    .update(crit, req.body)
                    .then(risk_res => cb(void 0, risk_res))
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
    app.del(`${namespace}/:id`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            req.getOrm().typeorm!.connection.getRepository(RiskRes)
                .delete({ createdAt: req.params.id })
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
