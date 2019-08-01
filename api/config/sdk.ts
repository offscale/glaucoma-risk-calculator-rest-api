import * as restify from 'restify';
import { waterfall } from 'async';

import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Config } from './models';


export const getConfig = (req: restify.Request & IOrmReq): Promise<Config> =>
    new Promise<Config>((resolve, reject) =>
        req.getOrm().typeorm!.connection.getRepository(Config)
            .findOneOrFail()
            .then(config => {
                if (config == null) return reject(new NotFoundError('Config'));
                return resolve((config) as Config);
            })
            .catch(reject)
    );

export const upsertConfig = (req: restify.Request & IOrmReq): Promise<Config> =>
    new Promise<Config>((resolve, reject) => {
        const Config_r = req.getOrm().typeorm!.connection.getRepository(Config);

        // TODO: Transaction
        waterfall([
            cb => Config_r.findOneOrFail()
                .then(config => {
                    if (config == null)
                        return cb(new NotFoundError('Config'));
                    return cb(void 0, config[0]);
                })
                .catch(cb),
            (config, cb) =>
                Config_r
                    .update(config, Object.assign({}, config, req.body))
                    .then(config => {
                            if (config == null)
                                return cb(new NotFoundError('Config'));
                            return cb(void 0, config);
                        }
                    )
        ], (error: any, results?: Config[]) => {
            if (error != null) {
                if (error instanceof NotFoundError) {
                    const config = new Config();
                    Object.keys(req.body).forEach(k => config[k] = req.body[k]);
                    Config_r
                        .save(config)
                        .then(resolve)
                        .catch(reject);
                } else return reject(fmtError(error)!);
            } else if (results == null || !results.length)
                return reject(new NotFoundError('Config[]'));
            return resolve(results![0]);
        });
    });
