import { Server } from 'restify';
import { createLogger } from 'bunyan';
import { basename } from 'path';
import { waterfall } from 'async';

import { tearDownConnections } from '@offscale/orm-mw';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';
import { model_route_to_map } from '@offscale/nodejs-utils';
import { AccessTokenType, IModelRoute } from '@offscale/nodejs-utils/interfaces';

import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { AccessToken } from '../../../api/auth/models';
import { _orms_out } from '../../../config';
import { User } from '../../../api/user/models';
import { closeApp, create_and_auth_users, unregister_all } from '../../shared_tests';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { SurveyTestSDK } from './survey_test_sdk';
import { survey_mocks } from './survey_mocks';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    survey: all_models_and_routes_as_mr['survey']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: User[] = user_mocks.successes.slice(132, 144);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('Survey::routes', () => {
    let sdk: SurveyTestSDK;
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
                    sdk = new SurveyTestSDK(app);
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

    describe('/api/survey', () => {
        const surveys = survey_mocks.successes.slice(0, 2);

        after('deleteAllSurveys', async () => {
            for (const survey of surveys)
                await sdk.destroy(access_token, survey)
        });

        it('POST should create Survey', async () =>
            surveys[0] = (await sdk.create(access_token, surveys[0])).body
        );

        it('GET should retrieve all Survey', async () => {
            surveys[1] = (await sdk.create(access_token, surveys[1])).body;
            await sdk.getAll(access_token)
        });
    });

    describe('/api/survey/:createdAt', () => {
        const surveys = survey_mocks.successes.slice(2, 4);

        before('createSurvey', async () =>
            surveys[0] = (await sdk.create(access_token, surveys[0])).body
        );

        after('deleteSurveys', async () => {
            for (const survey of surveys)
                await sdk.destroy(access_token, survey);
        });

        it('GET should retrieve Survey', async () =>
            await sdk.get(access_token, surveys[0])
        );

        it('DELETE should destroy Survey', async () => {
            surveys[1] = (await sdk.create(access_token, surveys[1])).body;
            await sdk.destroy(access_token, surveys[1]);
        });
    });
});
