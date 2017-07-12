import { series } from 'async';
import { expect } from 'chai';
import { IModelRoute } from 'nodejs-utils';
import { Server } from 'restify';
import { strapFramework } from 'restify-waterline-utils';
import { Collection, Connection, WLError } from 'waterline';
import { IUserBase } from '../../../api/user/models.d';
import { tearDownConnections } from '../../shared_tests';
import { user_mocks } from '../user/user_mocks';
import { AccessToken } from './../../../api/auth/models';
import { all_models_and_routes, c, IObjectCtor, strapFrameworkKwargs } from './../../../main';
import { AuthTestSDK } from './../auth/auth_test_sdk';
import { IAuthSdk } from './auth_test_sdk.d';
import IAssertionError = Chai.AssertionError;

declare const Object: IObjectCtor;

const models_and_routes: IModelRoute = {
    user: all_models_and_routes['user'],
    auth: all_models_and_routes['auth']
};

process.env['NO_SAMPLE_DATA'] = 'true';

const mocks: IUserBase[] = user_mocks.successes.slice(0, 10);

describe('Auth::routes', () => {
    let sdk: IAuthSdk;
    let app: Server;

    before(done =>
        series([
            cb => tearDownConnections(c.connections, cb),
            cb => strapFramework(Object.assign({}, strapFrameworkKwargs, {
                models_and_routes,
                createSampleData: false,
                start_app: false,
                use_redis: true,
                app_name: 'test-auth-api',
                callback: (err, _app, _connections: Connection[], _collections: Collection[]) => {
                    if (err != null) return cb(err);
                    c.connections = _connections;
                    c.collections = _collections;
                    app = _app;
                    sdk = new AuthTestSDK(app);
                    return cb();
                }
            }))], done)
    );

    // Deregister database adapter connections
    after(done => tearDownConnections(c.connections, done));

    describe('/api/auth', () => {
        beforeEach(done => sdk.unregister_all(mocks, () => done()));
        afterEach(done => sdk.unregister_all(mocks, () => done()));

        it('POST should login user', done => {
            series([
                    cb => sdk.register(mocks[1], cb),
                    cb => sdk.login(mocks[1], cb)
                ],
                done
            );
        });

        it('POST should fail to register user twice', done =>
            series([
                    cb => sdk.register(mocks[2], cb),
                    cb => sdk.register(mocks[2], cb)
                ],
                (err: WLError | Error) => {
                    if (err != null) {
                        const expected_err = 'E_UNIQUE';
                        try {
                            expect(err['text']).to.contain(expected_err);
                            err = null;
                        } catch (e) {
                            err = e as IAssertionError;
                        } finally {
                            done(err);
                        }
                    } else return done();
                }
            )
        );

        it('DELETE should logout user', done =>
            sdk.unregister_all([mocks[3]],
                (error: Error) => done(typeof error['text'] === 'string' && error['text'] === JSON.stringify({
                        code: 'NotFoundError',
                        message: 'User not found'
                    }) ? null : error
                )
            )
        );
    });
});
