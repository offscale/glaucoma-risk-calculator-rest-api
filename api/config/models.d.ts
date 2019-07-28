export declare class Config {
    static _omit: string[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    client_id: string;
    client_secret?: string;
    tenant_id: string;
    access_token?: string;
    refresh_token?: string;
    state?: string;
    session_state?: string;
    from?: string;
}
