import * as restify from 'restify';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError, WaterlineError } from '@offscale/custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from '@offscale/restify-validators';
import { JsonSchema } from 'tv4';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { has_auth } from '../auth/middleware';
import { ISurvey } from './models.d';

/* tslint:disable:no-var-requires */
const survey_schema: JsonSchema = require('./../../test/api/survey/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_body, mk_valid_body_mw_ignore(survey_schema, ['createdAt', 'id']),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey: Query = req.getOrm().waterline!.collections!['survey_tbl'];

            Survey.create(req.body).exec((error: WLError | Error, survey: ISurvey) => {
                if (error != null) {
                    return next(new WaterlineError(error as WLError))
                } else if (survey == null) return next(new NotFoundError('Survey'));
                res.json(201, survey);
                return next();
            });
        }
    );
};

export const getAll = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace, has_auth('admin'),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Survey: Query = req.getOrm().waterline!.collections!['survey_tbl'];

            Survey.find().exec((error: WLError | Error, survey: ISurvey[]) => {
                if (error != null) return next(fmtError(error));
                else if (survey == null || !survey.length) return next(new NotFoundError('Survey'));

                Survey.query(`SELECT ethnicity, COUNT(*) FROM survey_tbl GROUP BY ethnicity;`, [], (e, r) => {
                    if (e != null) return next(fmtError(e));
                    res.json({ survey, ethnicity_agg: r.rows });
                    return next();
                });
            });
        }
    );
};
