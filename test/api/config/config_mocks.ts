import { Config } from '../../../api/config/models';

export const config_mocks: {successes: Config[], failures: Array<{}>} = {
    failures: [
        {}, { client_id: 0, tenant_id: '' }, { client_id: '', tenant_id: '' }
    ],
    successes: [
        { client_id: 'foo', tenant_id: 'bar' },
        { client_id: 'can', tenant_id: 'haz' }
    ].map((obj, idx) =>
        Object.assign(obj, {
            id: `${idx}`,
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1),
            updatedAt: new Date()
        })
    )
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(config_mocks);
}
