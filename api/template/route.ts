import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { JsonSchema } from 'tv4';
import { IOrmReq } from 'orm-mw';

import { has_auth } from '../auth/middleware';
import { ITemplate } from './models.d';
import { isISODateString } from './utils';

/* tslint:disable:no-var-requires */
const template_schema: JsonSchema = require('../../test/api/template/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:createdAt`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Template: Query = req.getOrm().waterline.collections['template_tbl'];

            const criteria = (() => {
                if (req.params.createdAt.indexOf('_') < 0) return;
                const [createdAt, kind] = req.params.createdAt.split('_');
                return Object.assign({ kind },
                    createdAt !== 'latest' && isISODateString(createdAt) ? { createdAt } : {}
                );
            })();
            const q = req.params.createdAt.startsWith('latest') ?
                Template.find(criteria).sort('createdAt DESC').limit(1) :
                Template.findOne(criteria);

            q.exec((error: WLError, template: ITemplate | ITemplate[]) => {
                if (error != null) return next(fmtError(error));
                else if (template == null) return next(new NotFoundError('Template'));
                const _template: ITemplate = Array.isArray(template) ? template[0] : template;
                if (_template == null) return next(new NotFoundError('Template'));
                res.json(_template);
                return next();
            });
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:createdAt`, has_auth(), has_body, mk_valid_body_mw_ignore(template_schema, ['createdAt']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Template: Query = req.getOrm().waterline.collections['template_tbl'];

            req.body = Object.freeze({ contents: req.body.contents });
            const crit = Object.freeze({ createdAt: req.params.createdAt });
            // TODO: Transaction
            async.series({
                count: cb =>
                    Template.count(crit, (err: WLError, count: number) => {
                        if (err != null) return cb(err as any as Error);
                        else if (count == null) return cb(new NotFoundError('Template'));
                        return cb(null, count);
                    }),
                update: cb => Template.update(crit, req.body, (e, templates: ITemplate[]) =>
                    cb(e as any as Error, templates[0])
                )
            }, (error, results: {count: number, update: string}) => {
                if (error != null) return next(fmtError(error));
                res.json(200, results.update);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:createdAt`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Template: Query = req.getOrm().waterline.collections['template_tbl'];

            Template.destroy({ createdAt: req.params.createdAt }).exec((error: WLError) => {
                if (error != null) return next(fmtError(error));
                res.send(204);
                return next();
            });
        }
    );
};
