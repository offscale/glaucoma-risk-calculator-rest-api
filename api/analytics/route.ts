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

            const repo = req.getOrm().typeorm!.connection
                .getRepository(RiskRes);

            const q: Promise<RiskRes | undefined> = req.params.id === 'latest'
                ? repo
                    .createQueryBuilder('risk_res')
                    .addOrderBy('risk_res.createdAt', 'DESC')
                    .getOne()
                : repo.findOneOrFail(req.params.id);
            q
                .then((risk_res?: RiskRes) => {
                    if (risk_res == null) return next(new NotFoundError('RiskRes'));
                    res.json(risk_res);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
