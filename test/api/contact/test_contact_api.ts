import * as async from 'async';
import { createLogger } from 'bunyan';
import { model_route_to_map } from '@offscale/nodejs-utils';
import { IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { tearDownConnections } from '@offscale/orm-mw';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';
import { basename } from 'path';
import { Server } from 'restify';

import { AccessToken } from '../../../api/auth/models';
import { _orms_out } from '../../../config';
import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { create_and_auth_users, unregister_all } from '../../shared_tests';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { contact_mocks } from './contact_mocks';
import { ContactTestSDK } from './contact_test_sdk';
import { User } from '../../../api/user/models';
import { Contact } from '../../../api/contact/models';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    contact: all_models_and_routes_as_mr['contact']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: User[] = user_mocks.successes.slice(20, 30);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('Contact::routes', () => {
    let sdk: ContactTestSDK;
    let auth_sdk: AuthTestSDK;

    let mocks: {successes: Contact[], failures: Array<{}>};

    before(done =>
        async.waterfall([
                cb => tearDownConnections(_orms_out.orms_out, e => cb(e)),
                cb => AccessToken.reset() as any || cb(void 0),
                cb => setupOrmApp(
                    model_route_to_map(models_and_routes), { logger },
                    { skip_start_app: true, app_name: tapp_name, logger },
                    cb
                ),
                (_app: Server, orms_out: IOrmsOut, cb) => {
                    AccessToken.reset();
                    mocks = contact_mocks(user_mocks_subset);

                    auth_sdk = new AuthTestSDK(_app);
                    sdk = new ContactTestSDK(_app);

                    return cb(void 0);
                },
                cb => create_and_auth_users(user_mocks_subset, auth_sdk, cb)
            ],
            done
        )
    );

    // Deregister database adapter waterline_c
    before(async () => await unregister_all(auth_sdk, user_mocks_subset));
    after('tearDownConnections', done => tearDownConnections(_orms_out.orms_out, done));

    describe('/api/contact', () => {
        afterEach('deleteContact', async () =>
            await sdk.destroy(user_mocks_subset[0].access_token!, mocks.successes[0])
        );

        it('POST should create contact', async () =>
            await sdk.create(user_mocks_subset[0].access_token!, mocks.successes[0])
        );

        it('GET should get all contacts', async () => {
            await sdk.create(user_mocks_subset[0].access_token!, mocks.successes[0]);
            await sdk.getAll(user_mocks_subset[0].access_token!, mocks.successes[0]);
        });
    });

    describe('/api/contact/:email', () => {
        before('createContact', async () =>
            await sdk.create(user_mocks_subset[0].access_token!, mocks.successes[1])
        );
        after('deleteContact', async () =>
            await sdk.destroy(user_mocks_subset[0].access_token!, mocks.successes[1])
        );

        it('GET should retrieve contact', async () =>
            await sdk.retrieve(user_mocks_subset[0].access_token!, mocks.successes[1])
        );

        it('PUT should update contact', async () =>
            await sdk.update(user_mocks_subset[0].access_token!, mocks.successes[1],
                {
                    owner: mocks.successes[1].owner,
                    email: mocks.successes[1].email,
                    name: `NAME: ${mocks.successes[1].email}`
                } as Contact)
        );

        it('DELETE should destroy contact', async () =>
            await sdk.destroy(user_mocks_subset[0].access_token!, mocks.successes[1])
        );
    });
});
