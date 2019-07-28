import * as restify from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Config } from './models';
export declare const getConfig: (req: restify.Request & IOrmReq) => Promise<Config>;
export declare const upsertConfig: (req: restify.Request & IOrmReq) => Promise<Config>;
