import { RiskStats } from '../../../api/risk_stats/models';
import * as faker from 'faker';

export const risk_stats_mocks: {successes: RiskStats[], failures: Array<{}>} = {
    failures: [
        {}, { risk_json: '' }, { risk_json: null }, { risk_json: undefined }, { risk_json: 0 }
    ],
    successes: Array(10)
        .fill(void 0)
        .map((_, idx) => {
            const risk_stats = new RiskStats();

            risk_stats.id = idx;
            risk_stats.risk_json = JSON.stringify({ words: faker.random.words() });
            risk_stats.createdAt = faker.date.past(Math.floor(Math.random() * 10) + 1);

            return risk_stats;
        })
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(risk_stats_mocks);
}
