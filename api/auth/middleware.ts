import { AuthError } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import * as restify from 'restify';

import { AccessToken } from './models';

export const has_auth = (scope = 'login') =>
    (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
        if (req.headers['x-access-token'] == null)
            if (req.params.access_token != null)
                req.headers['x-access-token'] = req.params.access_token;
            else
                return next(new AuthError('X-Access-Token header must be included', 403));

        AccessToken
            .get(req.getOrm().redis.connection)
            .findOne(req.headers['x-access-token'] as string, (err: Error, user_id: string) => {
                if (err != null) return next(err);
                else if (user_id == null)
                    return next(new AuthError('Invalid access token used', 403));
                req['user_id'] = user_id;
                return next();
            });
    };
