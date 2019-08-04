import * as async from 'async';
import { createLogger } from 'bunyan';
import { model_route_to_map } from '@offscale/nodejs-utils';
import { AccessTokenType, IModelRoute } from '@offscale/nodejs-utils/interfaces';
import { IOrmsOut } from '@offscale/orm-mw/interfaces';
import { basename } from 'path';
import { Server } from 'restify';

import { AccessToken } from '../../../api/auth/models';
import { all_models_and_routes_as_mr, setupOrmApp } from '../../../main';
import { closeApp, create_and_auth_users, tearDownConnections, unregister_all } from '../../shared_tests';
import { AuthTestSDK } from '../auth/auth_test_sdk';
import { user_mocks } from '../user/user_mocks';
import { User } from '../../../api/user/models';
import { Contact } from '../../../api/contact/models';
import { contact_mocks } from './contact_mocks';
import { ContactTestSDK } from './contact_test_sdk';

const models_and_routes: IModelRoute = {
    user: all_models_and_routes_as_mr['user'],
    auth: all_models_and_routes_as_mr['auth'],
    contact: all_models_and_routes_as_mr['contact']
};

process.env['NO_SAMPLE_DATA'] = 'true';
const user_mocks_subset: User[] = user_mocks.successes.slice(144, 156);

const tapp_name = `test::${basename(__dirname)}`;
const logger = createLogger({ name: tapp_name });

describe('Contact::routes', () => {
    let sdk: ContactTestSDK;
    let auth_sdk: AuthTestSDK;

    let mocks: {successes: Contact[], failures: Array<{}>} = contact_mocks(user_mocks_subset);
    let access_token: AccessTokenType;

    before(done =>
        async.waterfall([
                tearDownConnections,
                cb => AccessToken.reset() as any || cb(void 0),
                cb => setupOrmApp(
                    model_route_to_map(models_and_routes), { logger },
                    { skip_start_app: true, app_name: tapp_name, logger },
                    cb
                ),
                (_app: Server, orms_out: IOrmsOut, cb) => {
                    AccessToken.reset();

                    auth_sdk = new AuthTestSDK(_app);
                    sdk = new ContactTestSDK(_app);

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
    // Deregister database adapters
    after('tearDownConnections', tearDownConnections);
    after('closeApp', done => closeApp(sdk.app)(done));

    describe('/api/contact', () => {
        const contacts = mocks.successes.slice(0, 2);

        after('deleteContact', async () => {
            for (const contact of contacts)
                await sdk.destroy(access_token, contact);
        });

        it('POST should create contact', async () =>
            contacts[0] = (await sdk.create(access_token, contacts[0])).body
        );

        it('GET should get all contacts', async () => {
            contacts[1] = (await sdk.create(access_token, contacts[1])).body;
            await sdk.getAll(access_token, contacts[1]);
        });
    });

    describe('/api/contact/:email', () => {
        let contact: Contact = mocks.successes[2];

        before('createContact', async () =>
            contact = (await sdk.create(access_token, mocks.successes[2])).body
        );

        after('deleteContact', async () =>
            await sdk.destroy(access_token, contact)
        );

        it('GET should retrieve contact', async () =>
            await sdk.retrieve(access_token, contact)
        );

        it('PUT should update contact', async () =>
            await sdk.update(access_token, contact,
                Object.assign({}, contact, { name: `NAME: ${contact.email}` })
            )
        );

        it('DELETE should destroy contact', async () => {
            const _contact = (await sdk.create(access_token, mocks.successes[3])).body;
            await sdk.destroy(access_token, _contact)
        });
    });
});
