import { ISurveyBase } from '../../../api/survey/models.d';

export const survey_mocks: {successes: ISurveyBase[], failures: Array<{}>} = {
    failures: [
        {}, { perceived_risk: '' }, { eye_test_frequency: null }, { recruiter: undefined }, { behaviour_change: 0 }
    ],
    successes: [
        {
            perceived_risk: 88.3,
            recruiter: 'curious',
            eye_test_frequency: 'annual',
            glasses_use: 'astigmatism',
            behaviour_change: 'as_recommended',
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString()
        },
        {
            perceived_risk: 88.3,
            recruiter: 'family',
            eye_test_frequency: 'quinquennial',
            glasses_use: 'longsighted',
            behaviour_change: 'no_change',
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString()
        }
    ]
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(survey_mocks);
}
