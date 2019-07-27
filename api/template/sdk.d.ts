import { WLError } from 'waterline';
import * as restify from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { ITemplate } from './models.d';
export declare const readManyTemplates: (req: restify.Request & IOrmReq, cb: (err: WLError | Error, templates?: {
    templates: ITemplate[];
} | undefined) => void) => void;
