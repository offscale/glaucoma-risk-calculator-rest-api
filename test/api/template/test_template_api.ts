import { Server } from 'restify';
import { createLogger } from 'bunyan';
import { basename } from 'path';
import { waterfall } from 'async';

import { model_route_to_map } from '@offscale/nodejs-utils';
import { AccessTokenType, IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { tearDownConnections } from '@offscale/orm-mw';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';

import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { _orms_out } from '../../../config';
import { closeApp, create_and_auth_users, unregister_all } from '../../shared_tests';
import { AccessToken } from '../../../api/auth/models';
import { User } from '../../../api/user/models';
import { user_mocks } from '../user/user_mocks';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { TemplateTestSDK } from './template_test_sdk';
import { template_mocks } from './template_mocks';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    template: all_models_and_routes_as_mr['template']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: User[] = user_mocks.successes.slice(168, 182);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('Template::routes', () => {
    let sdk: TemplateTestSDK;
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
                    sdk = new TemplateTestSDK(app);
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

    after('deregister_all', async () => await unregister_all(auth_sdk, user_mocks_subset));
    after('tearDownConnections', done => tearDownConnections(_orms_out.orms_out, done));
    after('closeApp', done => closeApp(sdk!.app)(done));

    describe('/api/template', () => {
        const template = template_mocks.successes[0];

        after('deleteTemplate', async () =>
            await sdk.destroy(access_token, template)
        );

        it('POST should create Template', async () =>
            await sdk.create(access_token, template)
        );
    });

    describe('/api/template/:createdAt', () => {
        let template = template_mocks.successes[1];

        before('createTemplate', async () =>
            template = (await sdk.create(access_token, template)).body
        );
        after('deleteTemplate', async () =>
            await sdk.destroy(access_token, template)
        );

        it('GET should retrieve Template', async () =>
            await sdk.get(access_token, template)
        );

        it('PUT should update Template', async () =>
            await sdk.update(access_token, template,
                Object.assign({}, template, { contents: 'foo' })
            )
        );

        it('DELETE should destroy Template', async () => {
            let _template = template_mocks.successes[2];
            _template = (await sdk.create(access_token, _template)).body;
            await sdk.destroy(access_token, _template);
        });
    });
});
