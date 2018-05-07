import { IConfigBase } from '../../../api/config/models.d';

export const config_mocks: {successes: IConfigBase[], failures: Array<{}>} = {
    failures: [
        {}, { client_id: 0, tenant_id: '' }, { client_id: '', tenant_id: '' }
    ],
    successes: [
        { client_id: 'foo', tenant_id: 'bar' },
        { client_id: 'can', tenant_id: 'haz' }
    ]
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(config_mocks);
}
