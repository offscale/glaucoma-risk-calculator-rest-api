import * as faker from 'faker';

import { Template } from '../../../api/template/models';


export const template_mocks: {successes: Template[], failures: Array<{}>} = {
    failures: [
        {}, { contents: '' }, { contents: null }, { contents: undefined }, { contents: 0 }
    ],
    successes: Array(10)
        .fill(void 0)
        .map((_, idx) => {
            const template = new Template();

            template.id = idx.toString();
            template.createdAt = faker.date.past(Math.floor(Math.random() * 10) + 1);
            template.contents = faker.lorem.lines(1);
            template.kind = 'email';

            return template;
        })
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(template_mocks);
}
