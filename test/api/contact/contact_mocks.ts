import * as faker from 'faker';

import { user_mocks } from '../user/user_mocks';
import { User } from '../../../api/user/models';
import { Contact } from '../../../api/contact/models';


export const contact_mocks: (users: User[]) => {successes: Contact[], failures: Array<{}>} =
    (users: User[]) => ({
        failures: [
            {},
            { email: 'foo@bar.com ' },
            { password: 'foo ' },
            { email: 'foo@bar.com', password: 'foo', bad_prop: true }
        ],
        successes: Array(10)
            .fill(void 0)
            .map(() => {
                const contact = new Contact();

                contact.owner = faker.random.arrayElement(users).email;
                contact.email = faker.random.arrayElement(users).email;

                return contact;
            })
    });

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(contact_mocks(user_mocks.successes.slice(144, 156)));
}
