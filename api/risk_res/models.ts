import { IRiskRes } from './models.d';


export const RiskRes = {
    identity: 'risk_res_tbl',
    connection: 'main_db',
    _omit: [/*'uuid'*/],
    attributes: {
        age: {
            type: 'integer',
            required: true
        },
        client_risk: {
            type: 'float',
            required: true
        },
        gender: {
            type: 'string',
            required: true
        },
        ethnicity: {
            type: 'string',
            required: true
        },
        other_info: {
            type: 'string',
            required: false
        },
        //family_history_of_glaucoma? : string[],
        email: {
            type: 'string',
            required: false
        },
        toJSON: function toJSON() {
            let risk_res: IRiskRes = this.toObject();
            RiskRes._omit.map(k => delete risk_res[k]);
            for (const key in risk_res)
                if (risk_res.hasOwnProperty(key) && !risk_res[key]) delete risk_res[key];
            return risk_res;
        },
    }
};
