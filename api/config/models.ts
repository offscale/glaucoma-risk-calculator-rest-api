import { IConfig } from './models.d';

export const Config = {
    identity: 'config_tbl',
    connection: 'main_db',
    _omit: [/*'uuid'*/],
    attributes: {
        client_id: {
            type: 'string',
            required: true
        },
        client_secret: {
            type: 'string'
            // TODO: Move this somewhere encrypted
        },
        tenant_id: {
            type: 'string',
            required: true
        },
        id_token: {
            type: 'string'
        },
        access_token: {
            type: 'string'
        },
        refresh_token: {
            type: 'string'
        },
        state: {
            type: 'string'
        },
        session_state: {
            type: 'string'
        },
        from: {
            type: 'string'
        },
        toJSON: function toJSON() {
            const config: IConfig = this.toObject();
            Config._omit.map(k => delete config[k]);
            for (const key in config)
                if (config.hasOwnProperty(key) && config[key] == null) delete config[key];
            return config;
        }
    }
};
