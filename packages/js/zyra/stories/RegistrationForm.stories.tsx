import CustomForm from '../src/components/RegistrationForm';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CustomForm> = {
    title: 'Zyra/Components/Form/RegistrationForm',
    component: CustomForm,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CustomForm>;

export const TestRegistrationForm: Story = {
    args: {
        onChange: ({ formfieldlist, butttonsetting }) => {
            console.log('Form updated:', formfieldlist, butttonsetting);
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
        return <CustomForm {...args} />;
    },
};

export const AllFieldTypes: Story = {
    args: {
        name: 'registrationForm',
        setting: {
            registrationForm: {
                formfieldlist: [
                    { id: 1, type: 'title', label: 'Demo', required: true, name: 'FORM_TITLE' },
                    { id: 2, type: 'email', label: 'Email', required: false, name: 'email' },
                    { id: 3, type: 'text', label: 'Text', required: false, name: 'text' },
                    { id: 4, type: 'dropdown', label: 'Dropdown', required: false, name: 'dropdown', options: [] },
                    { id: 5, type: 'checkboxes', label: 'Checkbox', required: false, name: 'checkbox', options: []},
                    { id: 6, type: 'radio', label: 'Radio', required: false, name: 'radio', options: [] },
                    { id: 7, type:'multiselect', label: 'Multi Select', required: false, name: 'multiselect', options: [] },//mutiselect is working same as dropdown
                    { id: 8, type: 'datepicker', label: 'Date', required: false, name: 'date' },
                    { id: 9, type: 'TimePicker', label: 'Time', required: false, name: 'time' },
                    { id: 10, type: 'recaptcha', label: 'Captcha', required: false, name: 'captcha' },
                    { id: 11, type: 'textarea', label: 'Textarea', required: false, name: 'textarea' },
                    { id: 12, type: 'number', label: 'Number', required: false, name: 'number' },
                    { id: 13, type: 'phone', label: 'Phone', required: false, name: 'phone' },
                    { id: 14, type: 'fileupload', label: 'File Upload', required: false, name: 'fileupload' },
                ],
            },
        },
        onChange: console.log,
        proSettingChange: () => false,
    },
};

export const PrefilledForm: Story = {
    args: {
        name: 'registrationForm',
        setting: {
            registrationForm: {
                formfieldlist: [
                    {
                        id: 1,
                        type: 'title',
                        label: 'Vendor Registration',
                        required: true,
                        name: 'FORM_TITLE',
                    },
                    {
                        id: 2,
                        type: 'text',
                        label: 'Name',
                        required: true,
                        name: 'name',
                        placeholder: 'Enter your name',
                    },
                    {
                        id: 3,
                        type: 'email',
                        label: 'Email',
                        required: true,
                        name: 'email',
                        placeholder: 'Enter your email',
                    },
                    {
                        id: 4,
                        type: 'dropdown',
                        label: 'Service Type',
                        required: true,
                        name: 'service_type',
                        options: [
                            { label: 'Consulting', value: 'consulting' },
                            { label: 'Development', value: 'development' },
                            { label: 'Design', value: 'design' },
                        ],
                    },
                    {
                        id: 5,
                        type: 'textarea',
                        label: 'About Your Services',
                        required: false,
                        name: 'about_services',
                        placeholder: 'Describe your services',
                    },
                ],
                butttonsetting: {
                    button_text: 'Register',
                },
            },
        },
        onChange: console.log,
        proSettingChange: () => false,
    },
};

