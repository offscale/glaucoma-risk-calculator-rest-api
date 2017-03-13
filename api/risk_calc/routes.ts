import * as restify from 'restify';
import { has_auth } from '../auth/middleware';

export function create(app: restify.Server, namespace: string = ""): void {
    app.post(namespace, has_auth(),
        function (req: restify.Request, res: restify.Response, next: restify.Next) {
            res.json(200, 'progressing');
            console.info(+new Date());
            setTimeout(_ => console.info(+new Date()) || next(), 50000)
        }
    )
}
