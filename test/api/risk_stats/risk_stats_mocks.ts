import { RiskStats } from '../../../api/risk_stats/models';

export const risk_stats_mocks: {successes: RiskStats[], failures: Array<{}>} = {
    failures: [
        {}, { risk_json: '' }, { risk_json: null }, { risk_json: undefined }, { risk_json: 0 }
    ],
    successes: [
        {
            risk_json: 'foo',
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1)
        },
        {
            risk_json: 'bar',
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1)
        },
        {
            risk_json: 'can',
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1)
        }
    ].map((obj, idx) =>
        Object.assign(obj, {
            id: `${idx}`,
            ensureString: () => null,
            maybeJson: () => '',
            updatedAt: new Date()
        })
    )
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(risk_stats_mocks);
}
