import { Model } from 'waterline';

export interface IRiskRes extends Model, IRiskResBase {
    id?: number;
    updatedAt: Date;
}

export interface IRiskResBase {
    age: number;
    client_risk: number;
    gender: string;
    ethnicity: string;
    other_info?: string;
    sibling?: boolean; // sibling has glaucoma?
    parent?: boolean;  // parent has glaucoma?
    study: string;
    myopia?: boolean;
    diabetes?: boolean;
    createdAt?: string | Date;
}
