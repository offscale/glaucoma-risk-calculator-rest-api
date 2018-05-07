import { ITemplate } from './models.d';

export const Template = {
    identity: 'template_tbl',
    connection: 'main_db',
    _omit: [/*'uuid'*/],
    attributes: {
        contents: {
            type: 'string',
            required: true
        },
        kind: {
            type: 'string',
            required: true
        },
        toJSON: function toJSON() {
            const template: ITemplate = this.toObject();
            Template._omit.map(k => delete template[k]);
            for (const key in template)
                if (template.hasOwnProperty(key) && template[key] == null) delete template[key];
            return template;
        }
    }
};
