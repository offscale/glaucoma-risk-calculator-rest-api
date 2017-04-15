import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { fmtError, NotFoundError } from 'restify-errors';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { JsonSchema } from 'tv4';
import { c, IObjectCtor } from '../../main';
import { has_auth } from '../auth/middleware';
import { IEmailConf } from './models.d';

declare const Object: IObjectCtor;

/* tslint:disable:no-var-requires */
const email_tpl_schema: JsonSchema = require('./../../test/api/email_conf/schema');

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(), has_body, mk_valid_body_mw_ignore(email_tpl_schema, ['createdAt']),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const EmailConf: Query = c.collections['email_conf_tbl'];

            const _create = (cb) => {
                EmailConf.create(req.body).exec((error: WLError | Error, email_conf: IEmailConf) => {
                    if (error) return cb(fmtError(error));
                    else if (!email_conf) return cb(new NotFoundError('EmailConf'));
                    return cb(null, email_conf);
                });
            };

            // TODO: Transaction
            async.waterfall([
                cb =>
                    EmailConf.find().limit(1).exec((err: WLError, email_conf: IEmailConf) => {
                        if (err) return cb(err);
                        else if (!email_conf || !email_conf.length) return cb(new NotFoundError('EmailConf'));
                        else return cb(null, email_conf[0]);
                    }),
                (email_conf, cb) =>
                    EmailConf.update(email_conf, Object.assign({}, email_conf, req.body),
                        (e, email_confs: IEmailConf[]) => {
                            if (e) return cb(e);
                            else if (!email_confs || !email_confs.length) return cb(new NotFoundError('EmailConf[]'));
                            return cb(null, email_confs);
                        }
                    )
            ], (error: any, results: IEmailConf[][2]) => {
                if (error) {
                    if (error instanceof NotFoundError)
                        _create((err, email_tpl) => {
                                if (err) return next(err);
                                res.json(201, email_tpl);
                                return next();
                            }
                        );
                    else return next(fmtError(error));
                }
                /* tslint:disable:one-line */ // Bug in TSLint!
                else if (!results || !results.length)
                    return next(new NotFoundError('EmailConf[]'));
                else {
                    res.json(200, results[0]);
                    return next();
                }
            });
        }
    );
};

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(namespace, has_auth(),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const EmailConf: Query = c.collections['email_conf_tbl'];
            EmailConf.find().limit(1).exec((error: WLError, email_conf: IEmailConf[]) => {
                if (error) return next(fmtError(error));
                else if (!email_conf) return next(new NotFoundError('EmailConf'));
                res.json(email_conf[0]);
                return next();
            });
        }
    );
};
