import * as restify from 'restify';
import * as async from 'async';
import { Query, WLError } from 'waterline';
import { has_body, mk_valid_body_mw_ignore } from 'restify-validators';
import { fmtError, NotFoundError } from 'restify-errors';
import { JsonSchema } from 'tv4';
import { c } from '../../main';
import { has_auth } from '../auth/middleware';
import { IEmailTpl } from './models.d';

/* tslint:disable:no-var-requires */
const email_tpl_schema: JsonSchema = require('./../../test/api/email_tpl/schema');

export const read = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:createdAt`, has_auth(),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const EmailTpl: Query = c.collections['email_tpl_tbl'];

            const q = req.params.createdAt === 'latest' ?
                EmailTpl.find().sort('createdAt DESC')
                    .limit(1) :
                EmailTpl.findOne({createdAt: req.params.createdAt});
            q.exec((error: WLError, email_tpl: IEmailTpl | IEmailTpl[]) => {
                if (error) return next(fmtError(error));
                else if (!email_tpl) return next(new NotFoundError('EmailTpl'));
                const tpl: IEmailTpl = Array.isArray(email_tpl) ? email_tpl[0] : email_tpl;
                if (!tpl) return next(new NotFoundError('EmailTpl'));
                res.json(tpl);
                return next();
            });
        }
    );
};

export const update = (app: restify.Server, namespace: string = ''): void => {
    app.put(`${namespace}/:createdAt`, has_auth(), has_body, mk_valid_body_mw_ignore(email_tpl_schema, ['createdAt']),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const EmailTpl: Query = c.collections['email_tpl_tbl'];

            req.body = Object.freeze({tpl: req.body.tpl});
            const crit = Object.freeze({createdAt: req.params.createdAt});
            // TODO: Transaction
            async.series({
                count: cb =>
                    EmailTpl.count(crit, (err: WLError, count: number) => {
                        if (err) return cb(err);
                        else if (!count) return cb(new NotFoundError('EmailTpl'));
                        return cb(null, count);
                    }),
                update: cb => EmailTpl.update(crit, req.body, (e, email_tpls: IEmailTpl[]) => cb(e, email_tpls[0]))
            }, (error, results: { count: number, update: string }) => {
                if (error) return next(fmtError(error));
                res.json(200, results.update);
                return next();
            });
        }
    );
};

export const del = (app: restify.Server, namespace: string = ''): void => {
    app.del(`${namespace}/:createdAt`, has_auth(),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            const EmailTpl: Query = c.collections['email_tpl_tbl'];

            EmailTpl.destroy({createdAt: req.params.createdAt}).exec((error: WLError) => {
                if (error) return next(fmtError(error));
                res.send(204);
                return next();
            });
        }
    );
};
