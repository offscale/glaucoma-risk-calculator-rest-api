import { httpRequest } from '../../test/SampleData';
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

    public sendEmail(mail: IMail, callback: (error: Error, mail?: IMail) => void): void {
        console.info('sendEmail::mail:', mail, ';');

        const body = JSON.stringify({
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
        });

        httpRequest<IMail>({
                method: 'POST',
                host: 'https://graph.microsoft.com',
                path: '/v1.0/users/me/sendMail',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                    'Authorization': `Bearer ${this.access_token}`
                }
            }, body
        )
            .then(token_response => callback(void 0, token_response))
            .catch(callback);
    }
}
