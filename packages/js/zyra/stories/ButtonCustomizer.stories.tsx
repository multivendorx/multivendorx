import ButtonCustomizer from '../src/components/ButtonCustomiser';
import type { Meta, StoryObj } from '@storybook/react-vite';
import "../src/styles/common.scss";

const meta: Meta<typeof ButtonCustomizer> = {
    title: 'Zyra/Components/ButtonCustomizer',
    component: ButtonCustomizer,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ButtonCustomizer>;

export const TestButtonCustomizer: Story = {
    args: {
        onChange: (key, value, isRestoreDefaults) => {
            console.log('Changed:', key, value, isRestoreDefaults);
        },
        setting: {
            
        },
        className: 'custom-button',
        text: 'Customize',
        proSetting: true,
    },
    render: (args) => {
        return <div className='multivendorx-main-wrapper'><ButtonCustomizer {...args} /></div>;
    },
};
