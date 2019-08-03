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
import { RiskStatsTestSDK } from './risk_stats_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { risk_stats_mocks } from './risk_stats_mocks';
import { _orms_out } from '../../../config';
import { AccessToken } from '../../../api/auth/models';
import { User } from '../../../api/user/models';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    risk_stats: all_models_and_routes_as_mr['risk_stats']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: User[] = user_mocks.successes.slice(120, 132);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('RiskStats::routes', () => {
    let sdk: RiskStatsTestSDK;
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
                    sdk = new RiskStatsTestSDK(app);
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

    describe('routes', () => {
        describe('/api/risk_stats', () => {
            const risk_stats = risk_stats_mocks.successes[0];

            before('deleteRiskStats', async () => {
                try {
                    await sdk.destroy(access_token, risk_stats)
                } catch (e) {
                    //
                }
            });

            after('deleteRiskStats', async () =>
                await sdk.destroy(access_token, risk_stats)
            );

            it('POST should create RiskStats', async () =>
                await sdk.create(access_token, risk_stats)
            );
        });

        describe('/api/risk_stats/:createdAt', () => {
            let risk_statistics = risk_stats_mocks.successes.slice(1, 4);

            before('createRiskStats', async () => {
                risk_statistics[0] = Object.assign({},
                    risk_statistics[0],
                    (await sdk.create(access_token, risk_statistics[0])).body
                );
            });

            after('deleteRiskStats', async () => {
                for (const risk_stats of risk_statistics)
                    await sdk.destroy(access_token, risk_stats)
            });

            it('GET should retrieve RiskStats', async () =>
                await sdk.get(access_token, risk_statistics[0])
            );

            it('PUT should update RiskStats', async () => {
                risk_statistics[1] = Object.assign({},
                    risk_statistics[1],
                    (await sdk.create(access_token, risk_statistics[1])).body
                );
                await sdk.update(
                    access_token,
                    risk_statistics[1],
                    Object.assign({}, risk_statistics[1], { risk_json: 'json_risk' })
                )
            });

            it('DELETE should destroy RiskStats', async () => {
                risk_statistics[2] = (await sdk.create(access_token, risk_statistics[2])).body;
                await sdk.destroy(access_token, risk_statistics[2]);
            });
        });
    });
});
