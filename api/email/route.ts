import { waterfall } from 'async';
import * as restify from 'restify';
import { IOrmReq } from 'orm-mw';
import { fmtError } from 'custom-restify-errors';
import { Query } from 'waterline';

import { has_auth } from '../auth/middleware';
import { getConfig } from '../config/sdk';
import { readManyTemplates } from '../template/sdk';
import { IRiskRes } from '../risk_res/models.d';
import { MSGraphAPI } from './ms_graph_api';
import { IMail } from './ms_graph_api.d';

export const sendEmail = (app: restify.Server, namespace: string = ''): void => {
    app.post(`${namespace}/:recipient/:risk_id`, has_auth(),
        (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
            waterfall([
                    cb => getConfig(req, cb),
                    (config, cb) => readManyTemplates(req, (err, templates) =>
                        cb(err, config, templates)
                    ),
                    (config, templates, cb) => {
                        const RiskRes: Query = req.getOrm().waterline.collections['risk_res_tbl'];
                        RiskRes.findOne({ _id: req.params.risk_id }).exec((err, risk_res) =>
                            cb(err, risk_res, config, templates));
                    },
                    (risk_res: IRiskRes, config, templates, cb) => {
                        const templatesMap = new Map<string, string>();
                        templates.templates.forEach(template =>
                            templatesMap.set(template.kind, template.contents)
                        );

                        const safeGet = (map: Map<any, any>, key: any) =>
                            map.has(key) ? map.get(key) : void 0;

                        const share_url = `https://calculator.glaucoma.org.au/${risk_res.id}`;

                        MSGraphAPI.instance(config).sendEmail(
                            {
                                recipient: req.params.recipient,
                                subject: safeGet(templatesMap, 'email_subject'),
                                content: `${safeGet(templatesMap, 'email_contents')} ${share_url}`
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
