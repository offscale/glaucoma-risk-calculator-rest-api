export interface IMail {
    recipient: string;
    subject: string;
    content: string;
}

// https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/concepts/auth_v2_user.md#token-response
interface ITokenResponse {
    token_type: 'Bearer';
    scope: string;
    expires_in: number; // 3600
    ext_espires_in: 0;
    access_token: string;
    refresh_token: string;
}
