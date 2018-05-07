import { ITemplateBase } from '../../../api/template/models.d';

export const template_mocks: {successes: ITemplateBase[], failures: Array<{}>} = {
    failures: [
        {}, { contents: '' }, { contents: null }, { contents: undefined }, { contents: 0 }
    ],
    successes: [
        { contents: 'foo', createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString() },
        { contents: 'bar', createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString() },
        { contents: 'can', createdAt: new Date(Math.floor(Math.random() * 1000000000000) + 1).toISOString() }
    ].map(o => Object.assign(o, { kind: 'email' }))
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(template_mocks);
}
