import MergeComponent from '../src/components/MergeComponent';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MergeComponent> = {
    title: 'Zyra/Components/MergeComponent',
    component: MergeComponent,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MergeComponent>;

export const TestMergeComponent: Story = {
    args: {
        wrapperClass: 'merge-wrapper',
        descClass: 'settings-metabox-description',
        description: 'Merge multiple fields into one value.',
        onChange: (data) => {
            console.log('Merge data changed:', data);
        },
        value: {
            field1: 'option1',
            field2: 5,
            field3: 'Sample Text',
        },
        proSetting: true,
        fields: [
            {
                name: 'field1',
                type: 'select' as 'select',
                options: [
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                ],
                placeholder: 'Select an option',
            },
            {
                name: 'field2',
                type: 'number',
                placeholder: 'Enter a number',
            },
            {
                name: 'field3',
                type: 'text',
                placeholder: 'This is a text input',
            },
        ],
    },
    render: (args) => {
        return <MergeComponent {...args} />;
    },
};

export const EmptyFields: Story = {
    args: {
        fields: [],
        value: {},
        onChange: (data) => console.log('Changed:', data),
        description: 'No fields configured.',
        proSetting: false,
    },
};

export const SelectOnly: Story = {
    args: {
        fields: [
            {
                name: 'status',
                type: 'select',
                options: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                ],
            },
        ],
        value: { status: 'active' },
        onChange: (data) => console.log('Select changed:', data),
        description: 'Only select fields.',
        proSetting: true,
    },
};


export const MissingInitialValues: Story = {
    args: {
        description: 'No initial values provided.',
        onChange: (data) => console.log('Changed:', data),
        value: {}, // intentionally empty
        fields: [
            {
                name: 'level',
                type: 'number',
            },
            {
                name: 'mode',
                type: 'select',
                options: [
                    { value: 'auto', label: 'Auto' },
                    { value: 'manual', label: 'Manual' },
                ],
            },
            {
                name: 'label',
                type: 'text',
                placeholder: 'Enter label',
            },
        ],
    },
};