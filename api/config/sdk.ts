import * as restify from 'restify';
import { fmtError, NotFoundError } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import { Query, WLError } from 'waterline';

import { IConfig } from './models.d';

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
