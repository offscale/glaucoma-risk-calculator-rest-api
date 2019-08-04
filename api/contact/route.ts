import { waterfall } from 'async';
import * as restify from 'restify';
import { JsonSchema } from 'tv4';

import { fmtError, NotFoundError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { has_body, mk_valid_body_mw, mk_valid_body_mw_ignore } from '@offscale/restify-validators';

import { has_auth } from '../auth/middleware';
import { Contact } from './models';
import { emptyTypeOrmResponse, removePropsFromObj } from '../../utils';

/* tslint:disable:no-var-requires */
const contact_schema: JsonSchema = require('./../../test/api/contact/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:email`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            req.getOrm().typeorm!.connection.getRepository(Contact)
                .findOneOrFail({ owner: req['user_id'], email: req.params.email })
                .then(contact => {
                    res.json(contact);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:email`, has_body, mk_valid_body_mw(contact_schema, false),
        mk_valid_body_mw_ignore(contact_schema, ['Missing required property']), has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request & {user_id: string};
            const Contact_r = req.getOrm().typeorm!.connection.getRepository(Contact);

            req.body = removePropsFromObj(req.body, ['createdAt', 'updatedAt', 'id']);
            // TODO: Transaction
            waterfall([
                cb => Contact_r
                    .findOneOrFail({ owner: req.user_id, email: req.params.email })
                    .then(contact => cb(void 0, contact))
                    .catch(cb),
                (contact: Contact, cb) =>
                    Contact_r
                        .update(contact, req.body)
                        .then(contact_ret =>
                            cb(void 0, emptyTypeOrmResponse(contact_ret) ? contact : contact_ret)
                        )
                        .catch(cb)
            ], (error, contact?: Contact) => {
                if (error != null) return next(fmtError(error));
                res.json(contact);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:email`, has_auth(),
        (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;

            req.getOrm().typeorm!.connection.getRepository(Contact)
                .delete({ owner: req['user_id'], email: req.params.email })
                .then(() => {
                    res.send(204);
                    return next();
                })
                .catch(error => next(fmtError(error)));
        }
    );
};
