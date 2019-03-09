import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { has_body, mk_valid_body_mw } from 'restify-validators';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { JsonSchema } from 'tv4';
import { IOrmReq } from 'orm-mw';

import { has_auth } from '../auth/middleware';
import { ISurvey } from './models.d';


/* tslint:disable:no-var-requires */
const survey_schema: JsonSchema = require('./../../test/api/survey/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:id`,
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Survey: Query = req.getOrm().waterline.collections['survey_tbl'];
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
    app.put(`${namespace}/:id`, has_body, mk_valid_body_mw(survey_schema),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Survey: Query = req.getOrm().waterline.collections['survey_tbl'];

            const crit = Object.freeze({ id: req.params.id });
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
    app.del(`${namespace}/:id`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Survey: Query = req.getOrm().waterline.collections['survey_tbl'];

            Survey.destroy({ createdAt: req.params.id }).exec((error: WLError) => {
                if (error != null) return next(fmtError(error));
                res.send(204);
                return next();
            });
        }
    );
};
