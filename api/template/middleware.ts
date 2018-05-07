import * as restify from 'restify';
import { IOrmReq } from 'orm-mw';

export const body_date_to_s = (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
    req.body.createdAt = new Date(req.body.createdAt).toISOString();
    return next();
};
