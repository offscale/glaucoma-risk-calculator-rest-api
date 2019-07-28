import { User } from '../../../api/user/models';
import { Contact } from '../../../api/contact/models';
export declare const contact_mocks: (users: User[]) => {
    successes: Contact[];
    failures: Array<{}>;
};
