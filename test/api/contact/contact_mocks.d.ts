import { IContactBase } from '../../../api/contact/models.d';
import { User } from '../../../api/user/models';
export declare const contact_mocks: (users: User[]) => {
    successes: IContactBase[];
    failures: Array<{}>;
};
