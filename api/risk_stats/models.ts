import { IRiskStats } from './models.d';

function stringify(risk_stats: IRiskStats, cb) {
    if (typeof risk_stats.risk_json !== 'string') risk_stats.risk_json = JSON.stringify(risk_stats.risk_json);
    return cb();
}

export const RiskStats = {
    identity: 'risk_stats_tbl',
    connection: 'main_db',
    _omit: [/*'uuid'*/],
    attributes: {
        risk_json: {
            type: 'string',
            required: true
        },
        toJSON: function toJSON() {
            const risk_stats: IRiskStats = this.toObject();
            RiskStats._omit.map(k => delete risk_stats[k]);
            for (const key in risk_stats)
                if (risk_stats.hasOwnProperty(key) && !risk_stats[key]) delete risk_stats[key];
            if (typeof risk_stats.risk_json === 'string' && ['{', '['].indexOf(risk_stats.risk_json[0]) > -1)
                risk_stats.risk_json = JSON.parse(risk_stats.risk_json);
            return risk_stats;
        },
    },
    beforeValidate: stringify,
    beforeUpdate: stringify,
    beforeCreate: stringify
};
