import type { Meta, StoryObj } from '@storybook/react-vite';
import WpEditor from '../src/components/WpEditor';

const meta: Meta<typeof WpEditor> = {
    title: 'Zyra/Components/WpEditor',
    component: WpEditor,
    tags: ['autodocs'],
    argTypes: {
        apiKey: {
            control: 'text',
            description:
                'TinyMCE API key provided via MVX or TinyMCE dashboard',
        },
        value: {
            control: 'text',
            description: 'Initial HTML content of the editor',
        },
        onEditorChange: {
            action: 'editor-content-changed',
            description: 'Triggered when editor content changes',
        },
    },
    parameters: {
        docs: {
            description: {
                component:
                    'WpEditor is a controlled TinyMCE-based rich text editor used in MVX settings where HTML content is required.',
            },
        },
    },
};

export default meta;

type Story = StoryObj<typeof WpEditor>;

export const Default: Story = {
    args: {
        apiKey: 'your-api-key',
        value: '<p>Initial content</p>',
    },
};

export const EmptyContent: Story = {
    args: {
        apiKey: 'your-api-key',
        value: '',
    },
};

export const WithLongContent: Story = {
    args: {
        apiKey: 'your-api-key',
        value: `
            <h3>WpEditor Demo</h3>
            <p>This editor supports rich text and media content.</p>
        `,
    },
};
