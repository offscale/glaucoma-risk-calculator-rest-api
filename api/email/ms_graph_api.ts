import * as superagent from 'superagent';

import { IConfig } from '../config/models.d';
import { IMail } from './ms_graph_api.d';

export class MSGraphAPI {
    protected static _instance: MSGraphAPI;
    public tenant_id?: string;
    public client_id?: string;
    public refresh_token?: string;
    public access_token?: string;

    constructor() {}

    public static instance(config?: IConfig) {
        if (this._instance == null)
            this._instance = new MSGraphAPI();

        /* tslint:disable:no-unused-expression */
        config != null && Object.keys(config).map(k => {
            if (this._instance.hasOwnProperty(k))
                this._instance[k] = config[k];
        });

        return this._instance;
    }

    // TODO: Implement refresh_token->access_token flow

    public sendEmail(mail: IMail, cb: (error: Error, mail?: IMail) => void): void {
        console.info('sendEmail::mail:', mail, ';');

        const body = {
            message: {
                subject: mail.subject,
                toRecipients: [{
                    emailAddress: {
                        address: mail.recipient
                    }
                }],
                body: {
                    content: mail.content,
                    contentType: 'html'
                }
            }
        };

        superagent
            .post('https://graph.microsoft.com/v1.0/users/me/sendMail')
            .send(body)
            .set('Authorization', `Bearer ${this.access_token}`)
            .set('Content-Type', 'application/json')
            .then((response) => {
                if (response.status !== 202)
                    return cb(new Error(`Expected response.status of 202 got ${response.status}.
           Body: ${response.body}`));
                return cb(void 0, JSON.parse(response.body));
            });
    }
}
