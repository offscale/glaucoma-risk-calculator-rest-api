import { model_route_to_map } from '@offscale/nodejs-utils';
import { IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { Server } from 'restify';
import { createLogger } from 'bunyan';
import { basename } from 'path';
import { tearDownConnections } from '@offscale/orm-mw';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';
import { waterfall } from 'async';

import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { create_and_auth_users } from '../../shared_tests';
import { TemplateTestSDK } from './template_test_sdk';
import { user_mocks } from '../user/user_mocks';

import { AuthTestSDK } from '../auth/auth_test_sdk';
import { template_mocks } from './template_mocks';
import { AccessToken } from '../../../api/auth/models';
import { _orms_out } from '../../../config';
import { User } from '../../../api/user/models';
import { Template } from '../../../api/template/models';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    template: all_models_and_routes_as_mr['template']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: User[] = user_mocks.successes.slice(30, 40);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('Template::routes', () => {
    let sdk: TemplateTestSDK;
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
                    sdk = new TemplateTestSDK(app);
                    auth_sdk = new AuthTestSDK(app);

                    return cb(void 0);
                },
                cb => create_and_auth_users(user_mocks_subset, auth_sdk, cb)
            ],
            done
        )
    );

    after('tearDownConnections', done => tearDownConnections(_orms_out.orms_out, done));

    describe('/api/template', () => {
        afterEach('deleteTemplate', async () =>
            await sdk.destroy(user_mocks_subset[0].access_token!, template_mocks.successes[0])
        );

        it('POST should create Template', async () =>
            await sdk.create(user_mocks_subset[0].access_token!, template_mocks.successes[0])
        );
    });

    describe('/api/template/:createdAt', () => {
        before('createTemplate', async () => {
            try {
                await sdk.create(user_mocks_subset[0].access_token!, template_mocks.successes[1]);
            } catch {
                //
            }
        });
        after('deleteTemplate', async () =>
            await sdk.destroy(user_mocks_subset[0].access_token!, template_mocks.successes[1])
        );

        it('GET should retrieve Template', async () =>
            await sdk.get(user_mocks_subset[0].access_token!, template_mocks.successes[1])
        );

        it('PUT should update Template', async () =>
            await sdk.update(user_mocks_subset[0].access_token!, template_mocks.successes[1],
                { contents: 'foo', createdAt: template_mocks.successes[1].createdAt } as Template)
        );

        it('DELETE should destroy Template', async () =>
            await sdk.destroy(user_mocks_subset[0].access_token!, template_mocks.successes[1])
        );
    });
});
