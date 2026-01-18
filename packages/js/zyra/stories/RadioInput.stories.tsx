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

// Radio select (image-based) story
export const RadioSelectInput: Story = {
    args: {
        description: 'Select store banner style',
        inputWrapperClass: 'image-radio',
        name: 'Banner',
        type: 'radio-select',
        keyName: 'sample_radio_select',
        labelOverlayClass: 'image-radio-overlay',
        labelOverlayText: 'Select your Store',
        options: [
            {
                key: 'option1',
                name: 'Banner',
                label: 'Outer Space',
                value: 'template1',
                color: 'http://localhost/.../template1.jpg',
            },
            {
                key: 'option2',
                name: 'Banner',
                label: 'Green Lagoon',
                value: 'template2',
                color: 'http://localhost/.../template2.jpg',
            },
        ],
        proSetting: false,
        ...commonProps,
    },
    render: (args) => <RadioInput key="sample_radio_select" {...args} />,
};

// Radio color input story
export const RadioColorInput: Story = {
    args: {
        description: 'This is a simple radio color input',
        inputWrapperClass: 'color-radio',
        name: 'Radio Color',
        type: 'radio-color',
        keyName: 'sample_radio_color',
        options: [
            {
                key: 'option1',
                name: 'Radio Color',
                label: 'Blue Shades',
                value: 'option1',
                color: ['#202528', '#333b3d', '#3f85b9', '#316fa8'],
            },
            {
                key: 'option2',
                name: 'Radio Color',
                label: 'Green Shades',
                value: 'option2',
                color: ['#171717', '#212121', '#009788', '#00796a'],
            },
        ],
        proSetting: false,
        ...commonProps,
    },
    render: (args) => <RadioInput key="sample_radio_color" {...args} />,
};

export const NoSelection: Story = {
    args: {
        inputWrapperClass: 'basic-radio',
        name: 'themeColor',
        type: 'default',
        options: [
            { key: 'light', name: 'themeColor', value: 'light', label: 'Light' },
            { key: 'dark', name: 'themeColor', value: 'dark', label: 'Dark' },
        ],
        proSetting: true,
        ...commonProps,
    },
};