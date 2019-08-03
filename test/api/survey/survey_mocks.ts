import * as faker from 'faker';

import { Survey } from '../../../api/survey/models';


export const survey_mocks: {successes: Survey[], failures: Array<{}>} = {
    failures: [
        {}, { perceived_risk: '' }, { eye_test_frequency: null }, { recruiter: undefined }, { behaviour_change: 0 }
    ],
    successes: Array(10)
        .fill(void 0)
        .map((_, idx) => {
            const survey = new Survey();

            survey.id = idx;
            survey.createdAt = faker.date.past(Math.floor(Math.random() * 10) + 1);
            survey.perceived_risk = parseFloat('88.3');
            survey.recruiter = 'curious';
            survey.eye_test_frequency = 'annual';
            survey.glasses_use = 'astigmatism';
            survey.behaviour_change = 'as_recommended';

            return survey;
        })
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(survey_mocks);
}
