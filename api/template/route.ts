import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { fmtError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { Template } from './models';
import { parse_out_kind_dt } from './middleware';
import { removePropsFromObj } from '../../utils';

/* tslint:disable:no-var-requires */
const template_schema: JsonSchema = require('../../test/api/template/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:createdAt`, has_auth(), parse_out_kind_dt,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Template_r = req.getOrm().typeorm!.connection.getRepository(Template);

            const q: Promise<Template> = req.params.createdAt === 'latest'
                ? Template_r
                    .findOneOrFail(
                        req.params.kind == null ? {} : { kind: req.params.kind },
                        {
                            order: {
                                createdAt: 'DESC'
                            }
                        }
                    )
                : Template_r.findOneOrFail(Object.freeze(Object.assign(
                    { kind: req.params.kind },
                    req.params.id == null ? { createdAt: req.params.createdAt } : { id: req.params.id }
                )));

            q
                .then((template: Template) => {
                    res.json(template);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:createdAt`, has_auth(), has_body,
        mk_valid_body_mw_ignore(template_schema, ['createdAt']),
        parse_out_kind_dt,
        async (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Template_r = req.getOrm().typeorm!.connection.getRepository(Template);

            // req.body = Object.freeze({ contents: req.body.contents });
            try {
                const crit = Object.freeze(Object.assign(
                    { kind: req.params.kind },
                    req.body.id == null ? { createdAt: req.params.createdAt } : { id: req.body.id }
                ));
                req.body = removePropsFromObj(req.body, ['createdAt', 'updatedAt', 'id']);

                const template = new Template();
                Object
                    .keys(req.body)
                    .filter(k => k !== 'updatedAt')
                    .forEach(k => template[k] = req.body[k]);

                await Template_r
                    .createQueryBuilder()
                    .update(Template)
                    .set(template)
                    .where(crit)
                    .execute();

                res.json(await Template_r.findOneOrFail(template));
                return next();
            } catch (error) {
                return next(fmtError(error));
            }
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:createdAt`, has_auth(), parse_out_kind_dt,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            req.getOrm().typeorm!.connection.getRepository(Template)
                .createQueryBuilder()
                .delete()
                .from(Template)
                .where('createdAt = :createdAt', { createdAt: req.params.createdAt })
                .execute()
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
