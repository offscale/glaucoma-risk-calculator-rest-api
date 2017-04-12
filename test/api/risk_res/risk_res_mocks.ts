import { IObjectCtor } from '../../../main';
import { IRiskResBase } from '../../../api/risk_res/models.d';

declare const Object: IObjectCtor;

export const risk_res_mocks: { successes: IRiskResBase[], failures: Array<{}> } = {
    failures: [
        {}, {risk_json: ''}, {risk_json: null}, {risk_json: undefined}, {risk_json: 0}
    ],
    successes: [
        {
            age: 55, ethnicity: 'barbados', gender: 'male', client_risk: Math.random(),
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString()
        },
        {
            age: 55, ethnicity: 'barbados', gender: 'female', client_risk: Math.random(),
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString()
        },
        {
            age: 55, ethnicity: 'barbados', gender: 'female', client_risk: Math.random(),
            // family_history_of_glaucoma: ['sibling'],
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString()
        }
    ]
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(risk_res_mocks);
}
