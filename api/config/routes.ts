import * as restify from 'restify';
import { fmtError } from 'custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';
import { IOrmReq } from 'orm-mw';

import { has_auth } from '../auth/middleware';
import { getConfig, upsertConfig } from './sdk';

/* tslint:disable:no-var-requires */
const template_schema: JsonSchema = require('./../../test/api/config/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(template_schema, ['createdAt']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            upsertConfig(req, (err, config) => {
                if (err == null) return next(fmtError(err));
                res.json(201, config);
                return next();
            });
        }
    );
};

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            getConfig(req, (err, config) => {
                if (err != null) return fmtError(err);
                res.json(config);
                return next();
            });
        }
    );
};
