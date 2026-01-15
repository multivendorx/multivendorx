import Log from '../src/components/Log';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Log> = {
    title: 'Zyra/Components/Log',
    component: Log,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Log>;

export const TestLog: Story = {
    args: {
        apiLink: 'https://api.example.com/logs',
        downloadFileName: 'app-log.txt',
        appLocalizer: {
            nonce: 'example-nonce',
            tab_name: 'log',
            apiUrl: 'https://api.example.com',
            restUrl: 'https://api.example.com/rest',
        },
    },
    render: (args) => {
        return <Log {...args} />;
    },
};
