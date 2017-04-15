import * as restify from 'restify';
import { has_auth } from '../auth/middleware';

export const create = (app: restify.Server, namespace: string = ''): void => {
    app.post(namespace, has_auth(),
        (req: restify.Request, res: restify.Response, next: restify.Next) => {
            res.json(200, 'progressing');
            return next();
            // setTimeout(_ => console.info(+new Date()) || next(), 50000)
        }
    );
};
