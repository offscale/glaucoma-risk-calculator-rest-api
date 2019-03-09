import { ISurvey } from './models.d';

export const Survey = {
    identity: 'survey_tbl',
    connection: 'main_db',
    _omit: [/*'uuid'*/],
    attributes: {
        perceived_risk: {
            type: 'float',
            required: true
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
            required: true
        },
        toJSON: function toJSON() {
            const survey: ISurvey = this.toObject();
            Survey._omit.map(k => delete survey[k]);
            for (const key in survey)
                if (survey.hasOwnProperty(key) && survey[key] == null) delete survey[key];
            return survey;
        },
    }
};
