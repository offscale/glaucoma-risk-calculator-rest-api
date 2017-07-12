import { forEachOfLimit, parallel } from 'async';
import { NotFoundError } from 'custom-restify-errors';
import { Connection } from 'waterline';
import { Response } from 'supertest';

import { IUser, IUserBase } from '../api/user/models.d';
import { IAuthSdk } from './api/auth/auth_test_sdk.d';
import { IncomingMessageError, TCallback } from './shared_types';

export const tearDownConnections = (connections: Connection[], done: MochaDone) => {
    return connections ? parallel(Object.keys(connections).map(
        connection => connections[connection]._adapter.teardown
    ), () => {
        Object.keys(connections).forEach(connection => {
            if (['sails-tingo', 'waterline-nedb'].indexOf(connections[connection]._adapter.identity) < 0)
                connections[connection]._adapter.connections.delete(connection);
        });
        return done();
    }) : done();
};

interface IResponse extends Response {
    readonly body: ReadableStream | null | any | {access_token: string};
}

export const create_and_auth_users = (user_mocks_subset: IUserBase[], auth_sdk: IAuthSdk, done: MochaDone) => {
    // TODO: Build bulk API endpoints so this can be done efficiently.
    forEachOfLimit(user_mocks_subset, 1, (user: IUser, idx: number, callback) =>
        auth_sdk.register_login(user, (err, access_token: string) => {
            if (err != null) return callback(err);
            else if (access_token == null) return callback(new NotFoundError('AccessToken'));
            user.access_token = access_token;
            user_mocks_subset[idx] = user;
            return callback();
        }), done
    );
};

export const getError = (err: IncomingMessageError | Error): IncomingMessageError | Error => {
    if (err as any === false) return null;
    if (typeof err['jse_shortmsg'] !== 'undefined') {
        const e: IncomingMessageError = err as IncomingMessageError;
        return e != null && e.body && e.body.error_message ? JSON.parse(e.body.error_message) : e;
    }
    if (err != null && typeof err['text'] !== 'undefined')
        err.message += ' | ' + err['text'];
    return err;
};

export const superEndCb = (e: IncomingMessageError | Error, r: Response,
                           callback: TCallback<Error | IncomingMessageError, Response>) =>
    callback(r != null && r.error != null ? getError(r.error) : getError(e), r);

export const debugCb = (name: string, callback: TCallback<any, any>) => /* tslint:disable:no-console */
    (e: any, r: any) => console.warn(`${name}::e =`, e, `;\n${name}::r =`, r, ';') || callback(e, r);
