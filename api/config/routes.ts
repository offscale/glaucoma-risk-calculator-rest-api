import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { fmtError } from '@offscale/custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { getConfig, upsertConfig } from './sdk';

/* tslint:disable:no-var-requires */
const template_schema: JsonSchema = require('./../../test/api/config/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(template_schema, ['createdAt']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            upsertConfig(req, (err, config) => {
                if (err != null) return next(fmtError(err));
                res.json(config);
                return next();
            });
        }
    );
};

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            getConfig(req, (err, config) => {
                if (err != null) return fmtError(err);
                res.json(config);
                return next();
            });
        }
    );
};
