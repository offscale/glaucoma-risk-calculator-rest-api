import { existsSync, mkdirSync, writeFile } from 'fs';
import * as path from 'path';
import { homedir } from 'os';

import * as restify from 'restify';

import { fmtError } from '@offscale/custom-restify-errors';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { has_body } from '@offscale/restify-validators';


const parent = process.env.WORKING_DIR || path.join(homedir(), 'glaucoma-risk-calculator-data');
if (!existsSync(parent)) mkdirSync(parent);

export const emails_txt = path.join(parent, 'emails.txt');


export const post = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_body, (request: restify.Request, res: restify.Response, next: restify.Next) => {
            const req = request as unknown as IOrmReq & restify.Request;
            writeFile(emails_txt, `${JSON.stringify(req.body)}\n`, { flag: 'a' }, err => {
                if (err != null) {
                    res.send(500);
                    return next(fmtError(err));
                }
                res.send(200);
                return next();
            });
        }
    );
};
