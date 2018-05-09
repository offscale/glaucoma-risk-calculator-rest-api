import { waterfall } from 'async';
import * as restify from 'restify';
import { IOrmReq } from 'orm-mw';
import { fmtError } from 'custom-restify-errors';

import { has_auth } from '../auth/middleware';
import { getConfig } from '../config/sdk';
import { readManyTemplates } from '../template/sdk';
import { MSGraphAPI } from './ms_graph_api';
import { IMail } from './ms_graph_api.d';

export const sendEmail = (app: restify.Server, namespace: string = ''): void => {
    app.get(`${namespace}/:recipient`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            waterfall([
                    cb => getConfig(req, cb),
                    (config, cb) => readManyTemplates(req, (err, templates) =>
                        cb(err, config, templates)
                    ),
                    (config, templates, cb) => {
                        const templatesMap = new Map<string, string>();
                        templates.templates.forEach(template =>
                            templatesMap.set(template.kind, template.contents)
                        );

                        MSGraphAPI.instance(config).sendEmail(
                            {
                                recipient: req.params.recipient,
                                subject: templatesMap.get('email_subject'),
                                content: templatesMap.get('email_contents')
                            }, cb
                        );
                    }
                ],
                (errors, mail: IMail) => {
                    if (errors != null) return next(fmtError(errors));
                    res.json(mail);
                    return next();
                });
        }
    );
};
