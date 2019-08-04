import * as restify from 'restify';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { JsonSchema } from 'tv4';

import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { RiskRes } from '../risk_res/models';

/* tslint:disable:no-var-requires */
const risk_res_schema: JsonSchema = require('./../../test/api/risk_res/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:id`,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            const RiskRes_r = req.getOrm().typeorm!.connection
                .getRepository(RiskRes);

            const q: Promise<RiskRes> = req.params.id === 'latest'
                ? RiskRes_r
                    .findOneOrFail(void 0, {
                        order: {
                            createdAt: 'DESC'
                        }
                    })
                : RiskRes_r.findOneOrFail(req.params.id);
            q
                .then((risk_res: RiskRes) => {
                    res.json(risk_res);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
