import SettingMetaBox from "../src/components/SettingMetaBox";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SettingMetaBox> = {
  title: "Zyra/Components/Form/SettingMetaBox",
component: SettingMetaBox,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SettingMetaBox>;
const formField = {
        type: "text",
        name: "username",
        placeholder: "Enter your username",
        charlimit: 20,
        row: 1,
        column: 1,
        required: true,
        disabled: false,
    };

    const inputTypeList = [
        { value: "text", label: "Text" },
        { value: "email", label: "Email" },
        { value: "number", label: "Number" },
        { value: "textarea", label: "Textarea" },
        { value: "file", label: "File Upload" },
        { value: "recaptcha", label: "Google reCAPTCHA" },
    ];

export const TestSettingMetaBox : Story = {
    
    args : {
        formField: formField,
        inputTypeList: inputTypeList,
        onChange: ( field, value ) => {
            console.log( `Field changed: ${ field } = ${ value }` );
        },
        onTypeChange: ( value ) => {
            console.log( `Input type changed to: ${ value }` );
        },
        opened: { click: true },
    },
    render:(args)=>{
        return <SettingMetaBox { ...args } />;
    }
};
