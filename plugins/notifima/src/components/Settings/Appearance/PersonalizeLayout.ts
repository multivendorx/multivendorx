import { __ } from '@wordpress/i18n';

const LAYOUT_BLOCK_GROUPS = [
    {
        id: 'layout-blocks',
        label: 'Layout Blocks',
        icon: 'user',
        blocks: [
            {
                id: 'columns',
                icon: 'blocks',
                value: 'columns',
                label: 'Columns',
                fixedName: 'columns',
            },
            {
                id: 'heading',
                icon: 'form-textarea',
                value: 'heading',
                fixedName: 'heading',
                placeholder: 'Enter your heading here',
            },
            {
                id: 'richtext',
                icon: 't-letter-bold',
                value: 'richtext',
                fixedName: 'richtext',
                placeholder: 'Enter your text content here',
            },
            {
                id: 'button',
                icon: 'button',
                value: 'button',
                fixedName: 'button',
                placeholder: 'Click me',
            },
            {
                id: 'section',
                icon: 'section',
                value: 'section',
                fixedName: 'section',
            },
            {
                id: 'text',
                icon: 't-letter-bold',
                value: 'text',
                label: 'Enter the text',
                fixedName: 'Text',
                placeholder: 'Enter your text here',
            },
        ]
    }
];

export default {
    id: 'personalize-layout',
    priority: 2,
    headerTitle: __( 'Personalize Layout', 'notifima' ),
    headerDescription: __( 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet', 'notifima' ),
    headerIcon: 'form',
    submitUrl: 'settings',
    modal: [
        {
			key: 'personalize_layout_template',
			type: 'block-builder',
			classes: 'full-width',
			blockGroups: LAYOUT_BLOCK_GROUPS,
            visibleGroups: ['layout-blocks'],
			// defaultTemplateId: 'store-registration',
		},
    ],
};
