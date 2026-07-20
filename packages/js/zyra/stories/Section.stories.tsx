import Section from '../src/components/Section';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Section> = {
    title: 'Zyra/Components/Section',
    component: Section,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Section>;

export const DefaultSection: Story = {
    args: {
        wrapperClass: 'setting-section-divider',
        hint: 'Fill in all required fields carefully.',
        value: 'User Registration',
        description: 'This section contains user registration settings.',
    },
    render: (args) => <Section {...args} />,
};
