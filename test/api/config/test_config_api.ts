import { Server } from 'restify';
import { createLogger } from 'bunyan';
import * as path from 'path';
import { basename } from 'path';
import { waterfall } from 'async';

import { model_route_to_map } from '@offscale/nodejs-utils';
import { AccessTokenType, IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';

import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { AccessToken } from '../../../api/auth/models';
import { _orms_out } from '../../../config';
import { User } from '../../../api/user/models';
import { closeApp, create_and_auth_users, tearDownConnections, unregister_all } from '../../shared_tests';
import { Config } from '../../../api/config/models';
import { user_mocks } from '../user/user_mocks';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { ConfigTestSDK } from './config_test_sdk';
import { config_mocks } from './config_mocks';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    config: all_models_and_routes_as_mr['config']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: User[] = user_mocks.successes.slice(108, 120);

const tapp_name = `test::${basename(__dirname)}`;
const connection_name = `${tapp_name}::${path.basename(__filename).replace(/\./g, '-')}`;
const logger = createLogger({ name: tapp_name });

describe('Config::routes', () => {
    let sdk: ConfigTestSDK;
    let auth_sdk: AuthTestSDK;
    let app: Server;
    let access_token: AccessTokenType;

    before('app & db', done => {
        waterfall([
                tearDownConnections,
                cb => typeof AccessToken.reset() === 'undefined' && cb(void 0),
                cb => setupOrmApp(model_route_to_map(models_and_routes),
                    { logger, connection_name },
                    { skip_start_app: true, app_name: tapp_name, logger },
                    cb
                ),
                (_app: Server, orms_out: IOrmsOut, cb) => {
                    app = _app;
                    _orms_out.orms_out = orms_out;

                    sdk = new ConfigTestSDK(_app);
                    auth_sdk = new AuthTestSDK(_app);

                    return cb(void 0);
                },
                cb => create_and_auth_users(user_mocks_subset, auth_sdk, cb),
                cb => {
                    access_token = user_mocks_subset[0].access_token!;
                    return cb(void 0);
                }
            ],
            done
        );
    });

    after('deregister_all', async () => await unregister_all(auth_sdk, user_mocks_subset));
    after('tearDownConnections', tearDownConnections);
    after('closeApp', done => closeApp(sdk!.app)(done));

    describe('/api/config', () => {
        after('delete configs', async () =>
            await _orms_out.orms_out.typeorm!.connection.getRepository(Config).remove(
                config_mocks.successes.slice(0, 2)
            )
        );

        it('POST should create Config', async () =>
            config_mocks.successes[0] = (await sdk.create(access_token, config_mocks.successes[0])).body
        );

        it('GET should retrieve Config', async () => {
            const config = config_mocks.successes[1];
            config_mocks.successes[1] = (await sdk.create(access_token, config)).body;
            await sdk.get(access_token, config);
        });
    });
});
