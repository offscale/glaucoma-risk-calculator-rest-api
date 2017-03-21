import { IObjectCtor } from '../../../main';
import { IRiskStatsBase } from '../../../api/risk_stats/models.d';

declare const Object: IObjectCtor;

export const risk_stats_mocks: { successes: Array<IRiskStatsBase>, failures: Array<{}> } = {
    "failures": [
        {}, {risk_json: ''}, {risk_json: null}, {risk_json: undefined}, {risk_json: 0}
    ],
    "successes": [
        {risk_json: 'foo', createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString()},
        {risk_json: 'bar', createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString()},
        {risk_json: 'can', createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString()}
    ]
};

if (require.main === module) {
    console.info(risk_stats_mocks);
}
