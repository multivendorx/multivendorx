import FormViewer from '../src/components/FormViewer';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof FormViewer> = {
    title: 'Zyra/Components/FormViewer',
    component: FormViewer,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FormViewer>;

export const TestFormViewer: Story = {
    args: {
        formFields: {
            formfieldlist: [
                {
                    id: 'field1',
                    type: 'text',
                    name: 'username',
                    label: 'Username',
                    placeholder: 'Enter your username',
                    required: true,
                    charlimit: 50,
                },
                {
                    id: 'field2',
                    type: 'attachment',
                    name: 'profilePicture',
                    label: 'Profile Picture',
                    placeholder: 'Upload your profile picture',
                    required: true,
                    charlimit: 50,
                },
                {
                    id: 'field3',
                    type: 'textarea',
                    name: 'bio',
                    label: 'Bio',
                    row: 4,
                    col: 50,
                },
                {
                    id: 'field4',
                    type: 'dropdown',
                    name: 'country',
                    label: 'Country',
                    options: [
                        {
                            value: 'us',
                            label: 'United States',
                            isDefault: true,
                        },
                        { value: 'ca', label: 'Canada' },
                        { value: 'uk', label: 'United Kingdom' },
                    ],
                },
            ],
            butttonsetting: {
                text: 'Submit',
                style: 'primary',
            },
        },
        onSubmit: (data: FormData) => {
            console.log('Form submitted:', Object.fromEntries(data.entries()));
        },
    },
    render: (args) => {
        return <FormViewer {...args} />;
    },
};
