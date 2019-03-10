import { Model } from 'waterline';

export interface ISurvey extends Model, ISurveyBase {
    id?: number;
    updatedAt: Date;
}

export interface ISurveyBase {
    perceived_risk?: number;
    recruiter: 'family' | 'recommended' | 'curious';
    eye_test_frequency: 'annual' | 'biennial' | 'quinquennial' | 'rarely' | 'never';
    glasses_use: 'shortsighted' | 'longsighted' | 'astigmatism' | 'other' | 'none';
    behaviour_change?: 'as_recommended' | 'less_likely' | 'no_change';
    risk_res_id?: number;
    createdAt?: string | Date;
}
