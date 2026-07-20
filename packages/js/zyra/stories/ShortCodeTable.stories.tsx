import ShortCodeTable from '../src/components/ShortCodeTable';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ShortCodeTable> = {
    title: 'Zyra/Components/ShortCodeTable',
    component: ShortCodeTable,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ShortCodeTable>;

export const DefaultTable: Story = {
    args: {
        descClass: 'settings-metabox-description',
        description: 'Here are the available shortcode options:',
        options: [
            { name: 'Option One', label: '[shortcode_1]', desc: 'Description for shortcode 1', arguments: '<b>arg1</b>' },
            { name: 'Option Two', label: '[shortcode_2]', desc: 'Description for shortcode 2', arguments: '<i>arg2</i>' },
        ],
        optionLabel: ['Name', 'Description', 'Arguments'],
        icon: 'adminlib-vendor-form-copy', // optional copy icon
    },
};

export const NoOptions: Story = {
    args: {
        descClass: 'settings-metabox-description',
        description: 'No shortcode options available at the moment.',
        options: [],
        optionLabel: ['Name', 'Description', 'Arguments'],
    },
};

export const WithoutLabels: Story = {
    args: {
        descClass: 'settings-metabox-description',
        description: 'Shortcodes displayed without column labels.',
        options: [
            { name: 'Option One', label: '[shortcode_1]', desc: 'Description for shortcode 1', arguments: '<b>arg1</b>' },
        ],
        optionLabel: [], // no headers
        icon: 'adminlib-vendor-form-copy',
    },
};

export const WithHTMLDescription: Story = {
    args: {
        descClass: 'settings-metabox-description',
        description: 'Here is a <strong>bolded</strong> description with HTML content.',
        options: [
            { name: 'Option One', label: '[shortcode_1]', desc: 'Description 1', arguments: '<em>argument1</em>' },
        ],
        optionLabel: ['Name', 'Description', 'Arguments'],
    },
};
