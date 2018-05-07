import { Model } from 'waterline';

export interface ITemplate extends Model, ITemplateBase {
    id?: number;
    updatedAt: Date;
}

export interface ITemplateBase {
    contents: string;
    kind: string;
    createdAt: Date | string;
}
