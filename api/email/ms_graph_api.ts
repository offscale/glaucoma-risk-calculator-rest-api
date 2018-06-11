import { httpRequest } from '../../test/SampleData';
import { IConfig } from '../config/models.d';
import { IMail } from './ms_graph_api.d';

export class MSGraphAPI {
    private static _storage = new Map<string, string>();
    protected static _instance: MSGraphAPI;

    public static client_secret?: string;
    public static tenant_id?: string;
    public static client_id?: string;
    public static refresh_token?: string;
    public static access_token?: string;

    public static instance(config?: IConfig): MSGraphAPI {
        if (MSGraphAPI._instance == null)
            MSGraphAPI._instance = new MSGraphAPI();

        /* tslint:disable:no-unused-expression */
        config != null && Object.keys(config).map(k => {
            console.info(`MSGraphAPI::_instance.hasOwnProperty(${k}) = ${config[k]}`);
            if (MSGraphAPI._instance.hasOwnProperty(k))
                MSGraphAPI._instance[k] = config[k];
            MSGraphAPI._storage.set(k, config[k]);
        });

        return MSGraphAPI._instance;
    }

    private static setAll() {
        MSGraphAPI._storage.forEach((k, v) => {
            if (MSGraphAPI._instance.hasOwnProperty(k))
                MSGraphAPI._instance[k] = MSGraphAPI._storage.get(k);
        });
    }

    public getNewAccessToken(callback: (error: Error, mail?: IMail) => void): any {
        // https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/concepts/auth_v2_user.md
        // #5-use-the-refresh-token-to-get-a-new-access-token
        MSGraphAPI.setAll();

        const body = JSON.stringify({
            client_id: MSGraphAPI.client_id,
            client_secret: MSGraphAPI.client_secret,
            refresh_token: MSGraphAPI.refresh_token,
            grant_type: 'refresh_token',
            scope: 'mail.send offline_access',
            redirect_uri: 'https://glaucoma.org.au/admin/email'
        });

        httpRequest<IMail>({
                method: 'POST',
                host: 'https://login.microsoftonline.com',
                path: '/common/oauth2/v2.0/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body)
                }
            }, body
        )
            .then(token_response => console.info('MSGraphAPI::getNewAccessToken::token_response:',
                token_response, ';') || callback(void 0, token_response))
            .catch(callback);
    }

    public sendEmail(mail: IMail, callback: (error: Error, mail?: IMail) => void): void {
        console.info('MSGraphAPI::sendEmail::mail:', mail, ';');
        MSGraphAPI.setAll();
        console.info('MSGraphAPI::sendEmail::MSGraphAPI._storage:', MSGraphAPI._storage, ';');

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

        const headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'Authorization': `Bearer ${MSGraphAPI.access_token}`
        };

        console.info('MSGraphAPI::sendEmail::headers:', headers, ';');

        httpRequest<IMail>({
                method: 'POST',
                host: 'https://graph.microsoft.com',
                path: '/v1.0/users/me/sendMail',
            headers
            }, body
        )
            .then(token_response => callback(void 0, token_response))
            .catch(callback);
    }
}
