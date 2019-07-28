import * as restify from 'restify';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import {
    has_body,
    jsonSchemaNamedArrayOf,
    mk_valid_body_mw,
    mk_valid_body_mw_ignore
} from '@offscale/restify-validators';
import { JsonSchema } from 'tv4';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { map } from 'async';
import { readManyTemplates } from './sdk';
import { Template } from './models';

/* tslint:disable:no-var-requires */
const template_schema: JsonSchema = require('../../test/api/template/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(template_schema, ['createdAt']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            if ((req.body as Template).kind == null)
                (req.body as Template).kind = 'email';

            const template = new Template();
            Object.keys(req.body).forEach(k => template[k] = req.body[k]);

            req.getOrm().typeorm!.connection.getRepository(Template)
                .save(template)
                .then((template: Template) => {
                    if (template == null) return next(new NotFoundError('Template'));
                    res.json(201, template);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const createBatch = (app: restify.Server, namespace: string = ''): void => {
    app.post(`${namespace}s`, has_auth(), has_body, mk_valid_body_mw(jsonSchemaNamedArrayOf(template_schema)),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Template_r = req.getOrm().typeorm!.connection.getRepository(Template);

            // TODO: raw query insert batch for efficiency + consistency
            map(req.body,
                (_template: Template, cb) => {
                    const tpl = new Template();
                    Object.keys(req.body).forEach(k => tpl[k] = req.body[k]);

                    Template_r
                        .save(tpl)
                        .then((template: Template) => {
                            if (template == null) return cb(new NotFoundError('Template'));
                            return cb(void 0, template);
                        })
                },
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
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            readManyTemplates(req, (err, templates) => {
                if (err != null) return next(fmtError(err));
                res.json(templates);
                return next();
            });
        }
    );
};
