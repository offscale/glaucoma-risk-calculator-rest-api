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
        successes: ((ob: Contact[] = []) => [
            `can ${Math.random()} count`, `can ${Math.random()} count`
        ].forEach(msg => ((date: Date) =>
            users.forEach((user: User, idx: number) => ob.push({
                email: user.email,
                owner: users[idx === 0 ? 1 : 0].email
            } as Contact)))(new Date())
        ) as any || ob)() as Contact[]
    });

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(contact_mocks(user_mocks.successes.slice(20, 30)));
}
