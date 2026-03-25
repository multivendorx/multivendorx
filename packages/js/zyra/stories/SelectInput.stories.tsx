import  { type SelectOption,SelectInputUI } from '../src/components/SelectInput';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SelectInputUI> = {
    title: 'Zyra/Components/Form/SelectInput',
    component: SelectInputUI,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SelectInputUI>;

// Sample options for the stories
const sampleOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
];

export const SingleSelect: Story = {
    args: {
        wrapperClass: 'select-wrapper-container',
        name: 'single-select',
        options: sampleOptions,
        value: 'option2',
        type: 'single-select',
        
    },
};

export const MultiSelect: Story = {
    args: {
        wrapperClass: 'select-wrapper-container',
        name: 'multi-select',
        options: sampleOptions,
        value: ['option1', 'option3'],
        type: 'multi-select',
        selectDeselect: true,
    },
};

export const WithNoDefaultValue: Story = {
    args: {
        wrapperClass: 'select-wrapper-container',
        name: 'no-default',
        options: sampleOptions,
        type: 'single-select',
    },
};
