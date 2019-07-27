import { NotFoundError } from '@offscale/custom-restify-errors';
import { Query, WLError } from 'waterline';
import * as restify from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';

import { ITemplate } from './models.d';

export const readManyTemplates = (req: restify.Request & IOrmReq,
                                  cb: (err: Error | WLError, templates?: {templates: ITemplate[]}) => void) => {
    const Template: Query = req.getOrm().waterline!.collections!['template_tbl'];
    Template.query(`SELECT DISTINCT ON (kind) * FROM template_tbl
                                             ORDER BY kind, "createdAt" DESC;`, [],
        (error, templates: {command: string, rowCount: number, oid: null, rows: ITemplate[]}) => {
            if (error != null) return cb(error);
            else if (templates == null) return cb(new NotFoundError('Template'));
            return cb(void 0, { templates: templates.rows });
        }
    );
};
