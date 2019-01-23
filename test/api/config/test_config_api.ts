import { IModelRoute, model_route_to_map } from 'nodejs-utils';
import { Server } from 'restify';
import { createLogger } from 'bunyan';
import { basename } from 'path';
import { IOrmsOut, tearDownConnections } from 'orm-mw';
import { waterfall } from 'async';

import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { create_and_auth_users } from '../../shared_tests';
import { ConfigTestSDK } from './config_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { IAuthSdk } from '../auth/auth_test_sdk.d';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { IUserBase } from '../../../api/user/models.d';
import { config_mocks } from './config_mocks';
import { AccessToken } from '../../../api/auth/models';
import { _orms_out } from '../../../config';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    config: all_models_and_routes_as_mr['config']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: IUserBase[] = user_mocks.successes.slice(40, 50);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('Config::routes', () => {
    let sdk: ConfigTestSDK;
    let auth_sdk: IAuthSdk;
    let app: Server;

    before(done =>
        waterfall([
                cb => tearDownConnections(_orms_out.orms_out, e => cb(e)),
                cb => AccessToken.reset() as any || cb(void 0),
                cb => setupOrmApp(
                    model_route_to_map(models_and_routes), { logger },
                    { skip_start_app: true, app_name: tapp_name, logger },
                    cb
                ),
                (_app: Server, orms_out: IOrmsOut, cb) => {
                    AccessToken.reset();
                    app = _app;
                    _orms_out.orms_out = orms_out;

                    auth_sdk = new AuthTestSDK(_app);
                    sdk = new ConfigTestSDK(app);
                    auth_sdk = new AuthTestSDK(app);

                    return cb(void 0);
                },
                cb => create_and_auth_users(user_mocks_subset, auth_sdk, cb)
            ],
            done
        )
    );

    after('tearDownConnections', done => tearDownConnections(_orms_out.orms_out, done));

    describe('/api/config', () => {
        it('POST should create Config', done => {
            sdk.create(user_mocks_subset[0].access_token, config_mocks.successes[0], done);
        });

        it('GET should retrieve Config', done => {
            sdk.get(user_mocks_subset[0].access_token, config_mocks.successes[0], done);
        });
    });
});
