import { ISurvey } from './models.d';

export const Survey = {
    identity: 'survey_tbl',
    connection: 'main_db',
    _omit: [/*'uuid'*/],
    attributes: {
        perceived_risk: {
            type: 'float',
            required: false
        },
        recruiter: {
            type: 'string',
            required: true
        },
        eye_test_frequency: {
            type: 'string',
            required: true
        },
        glasses_use: {
            type: 'string',
            required: true
        },
        behaviour_change: {
            type: 'string',
            required: false
        },
        risk_res_id: {
            type: 'integer',
            required: false
        },
        toJSON: function toJSON() {
            // @ts-ignore
            const survey: ISurvey = this.toObject();
            Survey._omit.map(k => delete survey[k]);
            for (const key in survey)
                if (survey.hasOwnProperty(key) && survey[key] == null) delete survey[key];
            return survey;
        },
    }
};
