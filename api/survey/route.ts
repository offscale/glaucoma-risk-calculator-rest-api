import { writeFile } from 'fs';

import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { has_body } from '@offscale/restify-validators';
import { fmtError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { emails_txt } from '../email/route';
import { Survey } from './models';


/* tslint:disable:no-var-requires */
const survey_schema: JsonSchema = require('./../../test/api/survey/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:createdAt`,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey_r = req.getOrm().typeorm!.connection.getRepository(Survey);

            const q: Promise<Survey> = req.params.createdAt === 'latest' ?
                Survey_r.findOneOrFail({
                    order: {
                        createdAt: 'DESC'
                    }
                }) : Survey_r.findOneOrFail({ createdAt: req.params.createdAt });

            q
                .then((survey: Survey) => {
                    res.json(survey);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:id`, has_body,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey_r = req.getOrm().typeorm!.connection.getRepository(Survey);

            const crit = Object.freeze({ id: req.params.id });

            const email: string | null = (() => {
                if (req.body.hasOwnProperty('email')) {
                    const thisEmail = req.body.email;
                    delete req.body.email;
                    return thisEmail
                } else {
                    return null
                }
            })();

            const survey = new Survey();
            Object
                .keys(req.body)
                .filter(k => k !== 'updatedAt')
                .forEach(k => survey[k] = req.body[k]);

            Survey_r
                .createQueryBuilder()
                .update(Survey)
                .set(survey)
                .where('id = :id', crit)
                .execute()
                .then(result => {
                    const fin = () =>
                        Survey_r
                            .findOneOrFail(crit)
                            .then(survey => {
                                res.json(survey);
                                return next();
                            })
                            .catch(e => next(fmtError(e)));
                    email == null ? fin()
                        : writeFile(emails_txt, `${JSON.stringify({ email })}\n`, { flag: 'a' },
                        e => {
                            if (e == null) return next(fmtError(e));
                            return fin();
                        });
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:createdAt`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey_r = req.getOrm().typeorm!.connection.getRepository(Survey);

            Survey_r
                .delete({ createdAt: req.params.createdAt })
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
