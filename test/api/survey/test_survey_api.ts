import { model_route_to_map } from '@offscale/nodejs-utils';
import { IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { Server } from 'restify';
import { Response } from 'supertest';
import { createLogger } from 'bunyan';
import { basename } from 'path';
import { tearDownConnections } from '@offscale/orm-mw';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';
import { waterfall } from 'async';

import { ISurvey } from '../../../api/survey/models.d';
import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { AccessToken } from '../../../api/auth/models';
import { _orms_out } from '../../../config';
import { create_and_auth_users } from '../../shared_tests';
import { user_mocks } from '../user/user_mocks';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { SurveyTestSDK } from './survey_test_sdk';
import { survey_mocks } from './survey_mocks';
import { User } from '../../../api/user/models';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    survey: all_models_and_routes_as_mr['survey']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: User[] = user_mocks.successes.slice(60, 70);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('Survey::routes', () => {
    let sdk: SurveyTestSDK;
    let auth_sdk: AuthTestSDK;
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
                    sdk = new SurveyTestSDK(app);
                    auth_sdk = new AuthTestSDK(app);

                    return cb(void 0);
                },
                cb => create_and_auth_users(user_mocks_subset, auth_sdk, cb)
            ],
            done
        )
    );

    after('tearDownConnections', done => tearDownConnections(_orms_out.orms_out, done));

    describe('/api/survey', () => {
        afterEach('deleteSurvey', done => {
            sdk.destroy(user_mocks_subset[0].access_token!, survey_mocks.successes[0], done);
        });

        it('POST should create Survey', done => {
            sdk.create(user_mocks_subset[0].access_token!, survey_mocks.successes[0], done);
        });

        it('GET should retrieve all Survey', done => {
            sdk.getAll(user_mocks_subset[0].access_token!, done);
        });
    });

    describe('/api/survey/:createdAt', () => {
        before('createSurvey', done => {
            sdk.create(user_mocks_subset[0].access_token!, survey_mocks.successes[1],
                (e, r?: Response) => {
                    if (e == null && r != null) survey_mocks.successes[1] = r.body as any;
                    return done();
                });
        });
        after('deleteSurvey', done => {
            sdk.destroy(user_mocks_subset[0].access_token!, survey_mocks.successes[1], done);
        });

        it('GET should retrieve Survey', done => {
            sdk.get(user_mocks_subset[0].access_token!, survey_mocks.successes[1] as ISurvey, done);
        });

        it('DELETE should destroy Survey', done => {
            sdk.destroy(user_mocks_subset[0].access_token!, survey_mocks.successes[1], done);
        });
    });
});
