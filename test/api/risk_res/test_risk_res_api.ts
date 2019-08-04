import { model_route_to_map } from '@offscale/nodejs-utils';
import { AccessTokenType, IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { Server } from 'restify';
import { createLogger } from 'bunyan';
import { basename } from 'path';
import { tearDownConnections } from '@offscale/orm-mw';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';
import { waterfall } from 'async';

import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { closeApp, create_and_auth_users, unregister_all } from '../../shared_tests';
import { RiskResTestSDK } from './risk_res_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { risk_res_mocks } from './risk_res_mocks';
import { AccessToken } from '../../../api/auth/models';
import { _orms_out } from '../../../config';
import { User } from '../../../api/user/models';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    risk_res: all_models_and_routes_as_mr['risk_res']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: User[] = user_mocks.successes.slice(156, 168);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('RiskRes::routes', () => {
    let sdk: RiskResTestSDK;
    let auth_sdk: AuthTestSDK;
    let app: Server;
    let access_token: AccessTokenType;

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
                    sdk = new RiskResTestSDK(app);
                    auth_sdk = new AuthTestSDK(app);

                    return cb(void 0);
                },
                cb => create_and_auth_users(user_mocks_subset, auth_sdk, cb),
                cb => {
                    access_token = user_mocks_subset[0].access_token!;
                    return cb(void 0);
                }
            ],
            done
        )
    );

    after('unregister_all', async () => unregister_all(auth_sdk, user_mocks_subset));
    after('tearDownConnections', done => tearDownConnections(_orms_out.orms_out, done));
    after('closeApp', done => closeApp(sdk.app)(done));

    describe('/api/risk_res', () => {
        let risk_res = risk_res_mocks.successes.slice(0, 2);

        after('deleteRiskRes', async () => {
            for (const _risk_res of risk_res)
                await sdk.destroy(access_token, _risk_res)
        });

        it('POST should create RiskRes', async () =>
            risk_res[0] = (await sdk.create(access_token, risk_res[0])).body
        );

        it('GET should retrieve all RiskRes', async () => {
            risk_res[1] = (await sdk.create(access_token, risk_res[1])).body;
            await sdk.getAll(access_token);
        });
    });

    describe('/api/risk_res/:createdAt', () => {
        let risk_res = risk_res_mocks.successes[2];

        before('createRiskRes', async () =>
            risk_res = (await sdk.create(access_token, risk_res)).body
        );

        after('deleteRiskRes', async () =>
            await sdk.destroy(access_token, risk_res)
        );

        it('GET should retrieve RiskRes', async () =>
            await sdk.get(access_token, risk_res)
        );

        it('DELETE should destroy RiskRes', async () => {
            const _risk_res = risk_res_mocks.successes[3];
            const response = await sdk.create(access_token, _risk_res);
            await sdk.destroy(access_token, response.body);
        });
    });
});
