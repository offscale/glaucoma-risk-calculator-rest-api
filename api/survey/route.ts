import { writeFile } from 'fs';

import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { has_body } from '@offscale/restify-validators';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { emails_txt } from '../email/route';
import { Survey } from './models';


/* tslint:disable:no-var-requires */
const survey_schema: JsonSchema = require('./../../test/api/survey/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:id`,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey_r = req.getOrm().typeorm!.connection.getRepository(Survey);

            const q: Promise<Survey | undefined> = req.params.id === 'latest'
                ? Survey_r
                    .createQueryBuilder('survey')
                    .addOrderBy('survey.createdAt', 'DESC')
                    .getOne()
                : Survey_r.findOneOrFail({ createdAt: req.params.createdAt });

            q
                .then((survey?: Survey) => {
                    if (survey == null) return next(new NotFoundError('Survey'));
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

            const email = (() => {
                if (req.body.hasOwnProperty('email')) {
                    const thisEmail = req.body.email;
                    delete req.body.email;
                    return thisEmail
                } else {
                    return null
                }
            })();

            Survey_r
                .createQueryBuilder()
                .update(Survey)
                .set(req.body)
                .where('id = :id', crit)
                .execute()
                .then(result =>
                    writeFile(emails_txt, `${JSON.stringify({ email })}\n`, { flag: 'a' },
                        e => {
                            if (e == null) return next(fmtError(e));
                            res.json(result);
                            return next();
                        }
                    )
                )
                .catch(error => next(fmtError(error)));
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:id`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey_r = req.getOrm().typeorm!.connection.getRepository(Survey);

            Survey_r
                .delete({ createdAt: req.params.id })
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
