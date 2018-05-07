import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';
import { has_auth } from '../auth/middleware';
import { IConfig } from './models.d';
import { IOrmReq } from 'orm-mw';

/* tslint:disable:no-var-requires */
const template_schema: JsonSchema = require('./../../test/api/config/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(template_schema, ['createdAt']),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Config: Query = req.getOrm().waterline.collections['config_tbl'];

            const _create = (cb) => {
                Config.create(req.body).exec((error: WLError | Error, config: IConfig) => {
                    if (error != null) return cb(fmtError(error));
                    else if (config == null) return cb(new NotFoundError('Config'));
                    return cb(null, config);
                });
            };

            // TODO: Transaction
            async.waterfall([
                cb =>
                    Config.find().limit(1).exec((err: WLError, config: IConfig[]) => {
                        if (err != null) return cb(err);
                        else if (config == null || !config.length) return cb(new NotFoundError('Config'));
                        else return cb(null, config[0]);
                    }),
                (config, cb) =>
                    Config.update(config, Object.assign({}, config, req.body),
                        (e, configs: IConfig[]) => {
                            if (e) return cb(e);
                            else if (configs == null || !configs.length)
                                return cb(new NotFoundError('Config[]'));
                            return cb(null, configs);
                        }
                    )
            ], (error: any, results: IConfig[][2]) => {
                if (error != null) {
                    if (error instanceof NotFoundError)
                        _create((err, template) => {
                                if (err != null) return next(err);
                            res.json(201, template);
                                return next();
                            }
                        );
                    else return next(fmtError(error));
                } else if (results == null || !results.length)
                    return next(new NotFoundError('Config[]'));
                else {
                    res.json(200, results[0]);
                    return next();
                }
            });
        }
    );
};

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            const Config: Query = req.getOrm().waterline.collections['config_tbl'];
            Config.find().limit(1).exec((error: WLError, config: IConfig[]) => {
                if (error != null) return next(fmtError(error));
                else if (config == null) return next(new NotFoundError('Config'));
                res.json(config[0]);
                return next();
            });
        }
    );
};
