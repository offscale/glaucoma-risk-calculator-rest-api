import { Template } from '../../../api/template/models';

export const template_mocks: {successes: Template[], failures: Array<{}>} = {
    failures: [
        {}, { contents: '' }, { contents: null }, { contents: undefined }, { contents: 0 }
    ],
    successes: [
        { contents: 'foo' },
        { contents: 'bar' },
        { contents: 'can' }
    ].map((obj, idx) =>
        Object.assign(obj, {
            id: `${idx}`,
            createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1),
            updatedAt: new Date(),
            kind: 'email'
        })
    )
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(template_mocks);
}
