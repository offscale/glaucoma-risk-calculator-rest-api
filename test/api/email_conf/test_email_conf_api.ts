import { IModelRoute } from 'nodejs-utils';
import { strapFramework } from 'restify-utils';
import { Collection, Connection } from 'waterline';
import { Server } from 'restify';
import { all_models_and_routes, c, IObjectCtor, strapFrameworkKwargs } from '../../../main';
import { create_and_auth_users, tearDownConnections } from '../../shared_tests';
import { EmailConfTestSDK } from './email_conf_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { IAuthSdk } from '../auth/auth_test_sdk.d';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { IUserBase } from '../../../api/user/models.d';
import { email_conf_mocks } from './email_conf_mocks';

declare const Object: IObjectCtor;

const models_and_routes: IModelRoute = {
    user: all_models_and_routes['user'],
    auth: all_models_and_routes['auth'],
    email_conf: all_models_and_routes['email_conf']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: IUserBase[] = user_mocks.successes.slice(40, 50);

describe('EmailConf::routes', () => {
    let sdk: EmailConfTestSDK;
    let auth_sdk: IAuthSdk;
    let app: Server;

    before('tearDownConnections', done => tearDownConnections(c.connections, done));

    before('strapFramework', done => strapFramework(Object.assign({}, strapFrameworkKwargs, {
        models_and_routes,
        createSampleData: false,
        start_app: false,
        use_redis: true,
        app_name: 'test-email-tpl-api',
        callback: (err, _app, _connections: Connection[], _collections: Collection[]) => {
            if (err) return done(err);
            c.connections = _connections;
            c.collections = _collections;
            app = _app;
            sdk = new EmailConfTestSDK(app);
            auth_sdk = new AuthTestSDK(app);
            return done();
        }
    })));

    before('Create & auth users', done => create_and_auth_users(user_mocks_subset, auth_sdk, done));

    // Deregister database adapter connections
    after('unregister all users', done => auth_sdk.unregister_all(user_mocks_subset, done));
    after('tearDownConnections', done => tearDownConnections(c.connections, done));

    describe('/api/email_conf', () => {
        it('POST should create EmailConf', done =>
            sdk.create(user_mocks_subset[0].access_token, email_conf_mocks.successes[0], done)
        );
        it('GET should retrieve EmailConf', done =>
            sdk.get(user_mocks_subset[0].access_token, email_conf_mocks.successes[0], done)
        );
    });
});
