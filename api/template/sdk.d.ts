import * as restify from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Template } from './models';
export declare const readManyTemplates: (req: restify.Request & IOrmReq, cb: (err?: Error | undefined, templates?: {
    templates: Template[];
} | undefined) => void) => void;
