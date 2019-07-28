import * as restify from 'restify';

import { NotFoundError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { Template } from './models';

export const readManyTemplates = (req: restify.Request & IOrmReq,
                                  cb: (err?: Error, templates?: {templates: Template[]}) => void) => {
    const Template_r = req.getOrm().typeorm!.connection.getRepository(Template);
    Template_r
        .query(`
    SELECT DISTINCT ON (kind) *
    FROM template_tbl
    ORDER BY kind, "createdAt" DESC;`)
        .then((templates: {command: string, rowCount: number, oid: null, rows: Template[]}) => {
            if (templates == null) return cb(new NotFoundError('Template'));
            return cb(void 0, { templates: templates.rows });
        })
        .catch(cb);
};
