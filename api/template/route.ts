import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { isISODateString } from './utils';
import { Template } from './models';

/* tslint:disable:no-var-requires */
const template_schema: JsonSchema = require('../../test/api/template/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:createdAt`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Template_r = req.getOrm().typeorm!.connection.getRepository(Template);

            const criteria = ((): {kind?: string, createdAt?: string} => {
                if (req.params.createdAt.indexOf('_') < 0) return {};
                const [createdAt, kind] = req.params.createdAt.split('_');
                return Object.assign({ kind },
                    createdAt !== 'latest' && isISODateString(createdAt) ? { createdAt } : {}
                );
            })();


            const q: Promise<Template | undefined> = req.params.id === 'latest'
                ? Template_r
                    .createQueryBuilder('template')
                    .addOrderBy('template.createdAt', 'DESC')
                    .where(criteria)
                    .getOne()
                : Template_r.findOneOrFail({ createdAt: req.params.createdAt });

            q
                .then((template?: Template | Template[]) => {
                    if (template == null) return next(new NotFoundError('Template'));
                    else if (Array.isArray(template))
                        template = template[0];
                    res.json(template);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:createdAt`, has_auth(), has_body, mk_valid_body_mw_ignore(template_schema, ['createdAt']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Template_r = req.getOrm().typeorm!.connection.getRepository(Template);

            req.body = Object.freeze({ contents: req.body.contents });
            const crit = Object.freeze({ createdAt: req.params.createdAt });

            Template_r
                .createQueryBuilder()
                .update(Template)
                .set(req.body)
                .where('createdAt = :createdAt', crit)
                .execute()
                .then(result => {
                    res.json(result);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:createdAt`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            req.getOrm().typeorm!.connection.getRepository(Template)
                .delete({ createdAt: req.params.createdAt })
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
