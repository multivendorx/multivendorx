import SelectInput, { type SelectOptions } from '../src/components/SelectInput';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SelectInput> = {
    title: 'Zyra/Components/Form/SelectInput',
    component: SelectInput,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SelectInput>;

// Sample options for the stories
const sampleOptions: SelectOptions[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
];

export const SingleSelectWithPrePostText: Story = {
    args: {
        wrapperClass: 'select-wrapper-container',
        name: 'single-select',
        options: sampleOptions,
        value: 'option2',
        type: 'single-select',
        description: 'Select one option from the dropdown.',
        descClass: 'description-text',
        preText: 'Before select:',
        postText: 'After select',
    },
};

export const MultiSelect: Story = {
    args: {
        wrapperClass: 'select-wrapper-container',
        name: 'multi-select',
        options: sampleOptions,
        value: ['option1', 'option3'],
        type: 'multi-select',
        description: 'You can select multiple options.',
        descClass: 'description-text',
        preText: 'Start:',
        onMultiSelectDeselectChange: (e) => {
            console.log('Deselect clicked', e);
        },
    },
};

export const WithNoDefaultValue: Story = {
    args: {
        wrapperClass: 'select-wrapper-container',
        name: 'no-default',
        options: sampleOptions,
        type: 'single-select',
        description: 'No default value is selected.',
        descClass: 'description-text',
    },
};

export const EmptyOptions: Story = {
    args: {
        wrapperClass: 'select-wrapper-container',
        name: 'empty-select',
        options: [],
        type: 'single-select',
        description: 'No options available.',
        descClass: 'description-text',
    },
};

export const NoPrePostText: Story = {
    args: {
        wrapperClass: 'select-wrapper-container',
        name: 'no-pre-post',
        options: sampleOptions,
        value: 'option2',
        type: 'single-select',
        description: 'Select one option from the dropdown.',
        descClass: 'description-text',
    },
};

export const MultiSelectWithDeselect: Story = {
    args: {
        wrapperClass: 'select-wrapper-container',
        name: 'multi-deselect',
        options: sampleOptions,
        value: ['option1', 'option2'],
        type: 'multi-select',
        selectDeselect: true,
        selectDeselectClass: 'btn-deselect',
        selectDeselectValue: 'Clear All',
        onMultiSelectDeselectChange: () =>
        console.log('Clear all clicked'),   
        preText: 'Choose options:',
    },
};
