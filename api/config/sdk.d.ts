import * as restify from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { Config } from './models';
export declare const getConfig: (req: restify.Request & IOrmReq, cb: (error?: Error | undefined, config?: Config | undefined) => void) => void;
export declare const upsertConfig: (req: restify.Request & IOrmReq, callback: (error?: Error | undefined, config?: Config | undefined) => void) => void;
