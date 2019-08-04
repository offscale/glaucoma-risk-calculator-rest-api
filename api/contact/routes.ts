import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { has_body, mk_valid_body_mw } from '@offscale/restify-validators';

import { has_auth } from '../auth/middleware';
import { Contact } from './models';
import { removePropsFromObj } from '../../utils';

/* tslint:disable:no-var-requires */
const contact_schema: JsonSchema = require('./../../test/api/contact/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    const add_owner_mw = (request: restify.Request, res: restify.Response, next: restify.Next) => {
        const req = request as unknown as IOrmReq & restify.Request;
        req.body.owner = req['user_id'];
        return next();
    };

    app.post(namespace, has_auth(), has_body, add_owner_mw, mk_valid_body_mw(contact_schema),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            const Contact_r = req.getOrm().typeorm!.connection.getRepository(Contact);

            req.body = removePropsFromObj(req.body, ['createdAt', 'updatedAt', 'id']);
            const contact = new Contact();
            Object.keys(req.body).forEach(k => contact[k] = req.body[k]);

            Contact_r
                .save(contact)
                .then((contact: Contact) => {
                    if (contact == null) return next(new NotFoundError('Contact'));
                    res.json(201, contact);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            req.getOrm().typeorm!.connection.getRepository(Contact)
                .find({ owner: req['user_id'] })
                .then((contacts: Contact[]) => {
                    if (contacts == null) return next(new NotFoundError('Contact'));
                    res.json({ contacts, owner: req['user_id'] });
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
