import { IModelRoute, model_route_to_map } from 'nodejs-utils';
import { Server } from 'restify';
import { createLogger } from 'bunyan';
import { basename } from 'path';
import { IOrmsOut, tearDownConnections } from 'orm-mw';
import { waterfall } from 'async';

import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { create_and_auth_users } from '../../shared_tests';
import { EmailTplTestSDK } from './email_tpl_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { IAuthSdk } from '../auth/auth_test_sdk.d';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { IUserBase } from '../../../api/user/models.d';
import { email_tpl_mocks } from './email_tpl_mocks';
import { IEmailTpl } from '../../../api/email_tpl/models.d';
import { AccessToken } from '../../../api/auth/models';
import { _orms_out } from '../../../config';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    email_tpl: all_models_and_routes_as_mr['email_tpl']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: IUserBase[] = user_mocks.successes.slice(30, 40);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('EmailTpl::routes', () => {
    let sdk: EmailTplTestSDK;
    let auth_sdk: IAuthSdk;
    let app: Server;

    before(done =>
        waterfall([
                cb => tearDownConnections(_orms_out.orms_out, e => cb(e)),
                cb => AccessToken.reset() || cb(void 0),
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
                    sdk = new EmailTplTestSDK(app);
                    auth_sdk = new AuthTestSDK(app);

                    return cb(void 0);
                },
                cb => create_and_auth_users(user_mocks_subset, auth_sdk, cb)
            ],
            done
        )
    );

    describe('/api/email_tpl', () => {
        afterEach('deleteEmailTpl', done =>
            sdk.destroy(user_mocks_subset[0].access_token, email_tpl_mocks.successes[0], done));

        it('POST should create EmailTpl', done =>
            sdk.create(user_mocks_subset[0].access_token, email_tpl_mocks.successes[0], done)
        );
    });

    describe('/api/email_tpl/:createdAt', () => {
        before('createEmailTpl', done =>
            sdk.create(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1], _ => done()));
        after('deleteEmailTpl', done =>
            sdk.destroy(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1], done));

        it('GET should retrieve EmailTpl', done =>
            sdk.get(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1], done)
        );

        it('PUT should update EmailTpl', done =>
            sdk.update(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1],
                { tpl: 'foo', createdAt: email_tpl_mocks.successes[1].createdAt } as IEmailTpl, done)
        );

        it('DELETE should destroy EmailTpl', done =>
            sdk.destroy(user_mocks_subset[0].access_token, email_tpl_mocks.successes[1], done)
        );
    });
});
