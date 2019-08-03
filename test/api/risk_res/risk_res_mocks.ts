import { RiskRes } from '../../../api/risk_res/models';
import * as faker from 'faker';


export const risk_res_mocks: {successes: RiskRes[], failures: Array<{}>} = {
    failures: [
        {}, { risk_json: '' }, { risk_json: null }, { risk_json: undefined }, { risk_json: 0 }
    ],
    successes: Array(10)
        .fill(void 0)
        .map((_, idx) => {
            const risk_res = new RiskRes();

            risk_res.id = idx;
            risk_res.createdAt = faker.date.past(Math.floor(Math.random() * 10) + 1);
            risk_res.age = Math.floor(faker.random.number({ min: 0, max: 100 }));
            risk_res.ethnicity = 'barbados';
            risk_res.study = 'barbados';
            risk_res.gender = 'male';
            risk_res.client_risk = Math.random();

            return risk_res;
        })
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(risk_res_mocks);
}
