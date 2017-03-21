import { Model } from 'waterline';

export interface IRiskStats extends Model, IRiskStatsBase {
    id?: number;
    updatedAt: Date;
}

export interface IRiskStatsBase {
    risk_json?: string | {} | JSON;
    createdAt: Date | string;
}
