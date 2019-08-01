import * as restify from 'restify';

import { IOrmReq } from '@offscale/orm-mw/interfaces';

export const body_date_to_s = (request: restify.Request, res: restify.Response, next: restify.Next) => {
    const req = request as unknown as IOrmReq & restify.Request;
    req.body.createdAt = new Date(req.body.createdAt).toISOString();
    return next();
};

export const parse_out_kind_dt = (request: restify.Request, res: restify.Response, next: restify.Next) => {
    const req = request as unknown as IOrmReq & restify.Request;

    req.params = req.params || {};
    req.body = req.body || {};

    if (Object.entries(req.body).length + Object.entries(req.params).length < 1)
        return next();

    if (req.params.createdAt != null)
        req.body.createdAt = req.params.createdAt;
    else
        req.params.createdAt = req.body.createdAt;

    if (req.body.createdAt == null)
        return next();

    const idx = req.body.createdAt.indexOf('_');
    if (idx > -1)
        [req.body.createdAt, req.body.kind] = [req.body.createdAt.slice(0, idx), req.body.createdAt.slice(idx + 1)];

    req.body.createdAt = req.params.createdAt = new Date(req.body.createdAt).toISOString();
    req.params.kind = req.body.kind;

    return next();
};
