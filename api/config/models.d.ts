import { Model, Record } from 'waterline';

export interface IConfig extends IConfigBase, Model, Record {
    id?: number;
    updatedAt: Date;
}

export interface IConfigBase {
    state?: string;
    id_token?: string;
    access_token?: string;
    from?: string;
    session_state?: string;
    client_id: string;
    // TODO: Move this somewhere encrypted
    client_secret?: string;
    tenant_id: string;
}
