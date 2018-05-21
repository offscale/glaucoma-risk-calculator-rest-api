import * as restify from 'restify';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import { Query, WLError } from 'waterline';

import { IConfig } from './models.d';
import * as async from 'async';

export const getConfig = (req: restify.Request & IOrmReq,
                          cb: (error: Error | WLError, config?: IConfig) => void) => {
    const Config: Query = req.getOrm().waterline.collections['config_tbl'];
    Config
        .find()
        .limit(1)
        .exec((error: WLError, configs: IConfig[]) => {
            if (error != null) return cb(fmtError(error));
            else if (configs == null) return cb(new NotFoundError('Config'));
            return cb(void 0, configs[0]);
        });
};

export const upsertConfig = (req: restify.Request & IOrmReq,
                             callback: (error: Error | WLError, config?: IConfig) => void) => {
    const Config: Query = req.getOrm().waterline.collections['config_tbl'];

    const _create = cb => {
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
                    if (err != null) return callback(err);
                    return callback(void 0, template);
                });
            else return callback(fmtError(error));
        } else if (results == null || !results.length)
            return callback(new NotFoundError('Config[]'));
        else return callback(void 0, results[0]);
    });
};
