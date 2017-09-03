import * as restify from 'restify';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';

import { has_auth } from '../auth/middleware';
import { IEmailTpl } from './models.d';
import { IOrmReq } from 'orm-mw';

/* tslint:disable:no-var-requires */
const email_tpl_schema: JsonSchema = require('./../../test/api/email_tpl/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(email_tpl_schema, ['createdAt']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const EmailTpl: Query = req.getOrm().waterline.collections['email_tpl_tbl'];

            EmailTpl.create(req.body).exec((error: WLError | Error, email_tpl: IEmailTpl) => {
                if (error != null) return next(fmtError(error));
                else if (email_tpl == null) return next(new NotFoundError('EmailTpl'));
                res.json(201, email_tpl);
                return next();
            });
        }
    );
};
