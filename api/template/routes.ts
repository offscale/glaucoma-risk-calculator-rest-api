import * as restify from 'restify';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { has_body, jsonSchemaNamedArrayOf, mk_valid_body_mw, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';
import { IOrmReq } from 'orm-mw';

import { has_auth } from '../auth/middleware';
import { ITemplate, ITemplateBase } from './models.d';
import { map } from 'async';
import { readManyTemplates } from './sdk';

/* tslint:disable:no-var-requires */
const template_schema: JsonSchema = require('../../test/api/template/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(template_schema, ['createdAt']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Template: Query = req.getOrm().waterline.collections['template_tbl'];

            if ((req.body as ITemplateBase).kind == null)
                (req.body as ITemplateBase).kind = 'email';

            Template.create(req.body).exec((error: WLError | Error, template: ITemplate) => {
                if (error != null) return next(fmtError(error));
                else if (template == null) return next(new NotFoundError('Template'));
                res.json(201, template);
                return next();
            });
        }
    );
};

export const createBatch = (app: restify.Server, namespace: string = ''): void => {
    app.post(`${namespace}s`, has_auth(), has_body, mk_valid_body_mw(jsonSchemaNamedArrayOf(template_schema)),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Template: Query = req.getOrm().waterline.collections['template_tbl'];

            // TODO: raw query insert batch for efficiency + consistency
            map(req.body,
                (_template: ITemplateBase, cb) =>
                    Template.create(_template).exec((error: WLError | Error, template: ITemplate) => {
                        if (error != null) return cb(error);
                        else if (template == null) return cb(new NotFoundError('Template'));
                        return cb(void 0, template);
                    }),
                (error, templates) => {
                    if (error != null) {
                        /*console.info('error.details =', error['details'], ';');

                        if (error.hasOwnProperty('_e') && (error['_e'] as Error).stack
                            && error['_e'].stack.indexOf('WLError') > -1) {

                            const err = new GenericError(error['details']);
                            err.cause = error['_e'];
                            err.name = 'WLError';
                            return next(err);
                        }*/

                        return next(fmtError(error));
                    } else if (templates == null) return next(new NotFoundError('Template'));
                    res.json(201, { templates });
                    return next();
                });
        }
    );
};

export const readBatch = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}s/latest`,
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            readManyTemplates(req, (err, templates) => {
                if (err != null) return next(fmtError(err));
                res.json(templates);
                return next();
            });
        }
    );
};
