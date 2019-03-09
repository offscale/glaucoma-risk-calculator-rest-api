import { existsSync, mkdirSync, writeFile } from 'fs';
import * as path from 'path';
import { homedir } from 'os';

import * as restify from 'restify';
import { fmtError } from 'custom-restify-errors';
import { IOrmReq } from 'orm-mw';
import { has_body } from "restify-validators";

const parent = process.env.WORKING_DIR || path.join(homedir(), 'glaucoma-risk-calculator-data');
if (!existsSync(parent)) mkdirSync(parent);

const emails_txt = path.join(parent, 'emails.txt');


export const post = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_body, (req: restify.Request & IOrmReq, res: restify.Response, next: restify.Next) => {
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
