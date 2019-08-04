import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { has_body, mk_valid_body_mw } from '@offscale/restify-validators';
import { fmtError } from '@offscale/custom-restify-errors';

import { has_auth } from '../auth/middleware';
import { RiskRes } from './models';
import { Survey } from '../survey/models';
import { removePropsFromObj } from '../../utils';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:id`,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const RiskRes_r = req.getOrm().typeorm!.connection.getRepository(RiskRes);
            const q: Promise<RiskRes> = RiskRes_r.findOneOrFail(
                req.params.id === 'latest' ? {
                    order: {
                        createdAt: 'DESC'
                    }
                } : req.params.id
            );
            q
                .then(risk_res => {
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

            req.body = removePropsFromObj(req.body, ['createdAt', 'updatedAt', 'id']);
            const risk_res = new RiskRes();
            Object.keys(req.body).forEach(k => risk_res[k] = req.body[k]);

            const crit = Object.freeze({ id: req.params.id });

            RiskRes_r
                .createQueryBuilder()
                .update(Survey)
                .set(risk_res)
                .where('id = :id', crit)
                .execute()
                .then(() =>
                    RiskRes_r
                        .findOneOrFail(crit)
                        .then(risk_res => {
                            res.json(risk_res);
                            return next();
                        })
                        .catch(e => next(fmtError(e)))
                )
                .catch(error => next(fmtError(error)));
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
