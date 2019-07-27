import * as restify from 'restify';
import { IOrmReq } from '@offscale/orm-mw/interfaces';
import { WLError } from 'waterline';
import { IConfig } from './models.d';
export declare const getConfig: (req: restify.Request & IOrmReq, cb: (error: Error | WLError, config?: IConfig | undefined) => void) => void;
export declare const upsertConfig: (req: restify.Request & IOrmReq, callback: (error: Error | WLError, config?: IConfig | undefined) => void) => void;
