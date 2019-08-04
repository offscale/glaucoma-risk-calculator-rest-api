import * as restify from 'restify';
import { waterfall } from 'async';

import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { removePropsFromObj } from '../../utils';
import { Config } from './models';


export const getConfig = (req: restify.Request & IOrmReq): Promise<Config> =>
    new Promise<Config>((resolve, reject) =>
        req.getOrm().typeorm!.connection.getRepository(Config)
            .findOneOrFail({
                order: {
                    createdAt: 'DESC'
                }
            })
            .then(config => resolve(config))
            .catch(reject)
    );

export const upsertConfig = (req: restify.Request & IOrmReq): Promise<Config> =>
    new Promise<Config>((resolve, reject) => {
        const Config_r = req.getOrm().typeorm!.connection.getRepository(Config);

        // TODO: Transaction
        waterfall([
            cb => Config_r.findOneOrFail({
                order: {
                    createdAt: 'DESC'
                }
            })
                .then(config => cb(void 0, config))
                .catch(cb),
            (config, cb) => {
                const new_config = Object.assign({}, config, req.body);
                Config_r
                    .update(config, new_config)
                    .then(config => {
                            if (config == null)
                                return cb(new NotFoundError('Config'));
                            return cb(void 0, Object.assign(new_config, config));
                        }
                    )
            }
        ], (error: any, results?: Config[]) => {
            if (error != null) {
                if (error instanceof NotFoundError) {
                    req.body = removePropsFromObj(req.body, ['createdAt', 'updatedAt', 'id']);
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
