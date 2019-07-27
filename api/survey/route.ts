import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { has_body } from '@offscale/restify-validators';
import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { JsonSchema } from 'tv4';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { ISurvey } from './models.d';
import { writeFile } from 'fs';
import { emails_txt } from '../email/route';


/* tslint:disable:no-var-requires */
const survey_schema: JsonSchema = require('./../../test/api/survey/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:id`,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey: Query = req.getOrm().waterline!.collections!['survey_tbl'];
            const q = req.params.id === 'latest' ?
                Survey.find().sort('createdAt DESC').limit(1)
                : Survey.findOne({ id: req.params.id });
            q.exec((error: WLError, survey: ISurvey | ISurvey[]) => {
                if (error != null) return next(fmtError(error));
                else if (survey == null) return next(new NotFoundError('Survey'));
                const stats: ISurvey = Array.isArray(survey) ? survey[0] : survey;
                if (stats == null) return next(new NotFoundError('Survey'));
                res.json(stats);
                return next();
            });
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:id`, has_body,
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey: Query = req.getOrm().waterline!.collections!['survey_tbl'];

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

            // TODO: Transaction
            async.series({
                count: cb =>
                    Survey.count(crit, (err: WLError | Error, count: number) => {
                        if (err != null) return cb(err as any as Error);
                        else if (!count) return cb(new NotFoundError('Survey'));
                        return cb(null, count);
                    }),
                update: cb => Survey.update(crit, req.body).exec((e, survey: ISurvey[]) =>
                    cb(e, survey[0])
                ),
                email: cb => email == null ? cb() :
                    writeFile(emails_txt, `${JSON.stringify({ email })}\n`, { flag: 'a' }, cb),
            }, (error, results: {count: number, update: string, email: undefined}) => {
                if (error != null) return next(fmtError(error));
                res.json(200, results.update);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:id`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey: Query = req.getOrm().waterline!.collections!['survey_tbl'];

            Survey.destroy({ createdAt: req.params.id }).exec((error: WLError) => {
                if (error != null) return next(fmtError(error));
                res.send(204);
                return next();
            });
        }
    );
};
