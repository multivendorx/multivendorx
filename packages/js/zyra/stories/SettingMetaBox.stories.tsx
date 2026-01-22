import SettingMetaBox from '../src/components/SettingMetaBox';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SettingMetaBox> = {
    title: 'Zyra/Components/Form/SettingMetaBox',
    component: SettingMetaBox,
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SettingMetaBox>;
const formField = {
    type: 'text',
    name: 'username',
    placeholder: 'Enter your username',
    charlimit: 20,
    row: 1,
    column: 1,
    required: true,
    disabled: false,
};

const inputTypeList = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'file', label: 'File Upload' },
    { value: 'recaptcha', label: 'Google reCAPTCHA' },
];

export const TestSettingMetaBox: Story = {
    args: {
        formField,
        inputTypeList,
        onChange: (field, value) => {
            console.log(`Field changed: ${field} = ${value}`);
        },
        onTypeChange: (value) => {
            console.log(`Input type changed to: ${value}`);
        },
        opened: { click: true },
    },
    render: (args) => {
        return <SettingMetaBox {...args} />;
    },
};

export const RecaptchaInvalidKey: Story = {
    args: {
        formField: {
            type: 'recaptcha',
            name: 'captcha',
            sitekey: '',
            disabled: true,
        },
        opened: { click: true },
        onChange: console.log,
    },
};

export const RecaptchaValidKey: Story = {
    args: {
        formField: {
            type: 'recaptcha',
            name: 'captcha',
            sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
            disabled: false,
        },
        opened: { click: true },
        onChange: console.log,
    },
};

// export const DropdownOptions: Story = {
//     args: {
//         formField: {
//             type: 'dropdown',
//             name: 'country',
//             label: 'Country',
//             options: [
//                 { id: '1', label: 'India', value: 'IN' },
//                 { id: '2', label: 'USA', value: 'US' },
//             ],
//         },
//         opened: { click: true },
//         onChange: console.log,
//     },
// }; styling problem