import * as restify from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

export const body_date_to_s = (request: restify.Request, res: restify.Response, next: restify.Next) => {
    const req = request as unknown as IOrmReq & restify.Request;
    req.body.createdAt = new Date(req.body.createdAt).toISOString();
    return next();
};
