import IconList from '../src/components/IconList';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof IconList> = {
    title: 'Zyra/Components/IconList',
    component: IconList,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof IconList>;

export const TestIconList: Story = {
    render: () => {
        return <IconList />;
    },
};

export const Dark: Story = {
    render: () => {
        return (
            <div style={{ backgroundColor: '#333', padding: '20px' }}>
                <IconList theme="dark" />
            </div>
        );
    },
};