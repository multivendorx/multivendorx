import CustomFrom from '../src/components/RegistrationForm';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CustomFrom> = {
    title: 'Zyra/Components/Form/RegistrationForm',
    component: CustomFrom,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CustomFrom>;

export const TestRegistrationForm: Story = {
    args: {
        onChange: ({ formfieldlist, buttonsetting }) => {
            console.log('Form updated:', formfieldlist, buttonsetting);
        },
        name: 'registrationForm',
        proSettingChange: () => {
            console.log('Pro setting checked.');
            return false;
        },
        formTitlePlaceholder: 'Enter your form title here',
        setting: {
            fullName: '',
            email: '',
            plan: 'basic',
            recaptcha: '',
        },
    },
    render: (args) => {
        return <CustomFrom {...args} />;
    },
};
