import RadioInput from '../src/components/RadioInput';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof RadioInput> = {
    title: 'Zyra/Components/RadioInput',
    component: RadioInput,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RadioInput>;

// Common props shared across all stories
const commonProps = {
    wrapperClass: 'radio-group',
    inputClass: '',
    descClass: 'settings-metabox-description',
    activeClass: 'radio-select-active',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Radio changed:', e.target.value);
    },
};

// Default radio input story
export const DefaultRadioInput: Story = {
    args: {
        description: 'Choose your preferred theme color.',
        inputWrapperClass: 'basic-radio',
        value: 'dark',
        name: 'themeColor',
        type: 'default',
        keyName: 'themeColorOption',
        options: [
            { key: 'light', name: 'themeColor', value: 'light', label: 'Light Mode' },
            { key: 'dark', name: 'themeColor', value: 'dark', label: 'Dark Mode' },
            { key: 'custom', name: 'themeColor', value: 'custom', label: 'Custom Theme' },
        ],
        proSetting: false,
        ...commonProps,
    },
    render: (args) => <RadioInput {...args} />,
};

