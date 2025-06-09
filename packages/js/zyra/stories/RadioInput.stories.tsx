import RadioInput from "../src/components/RadioInput";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof RadioInput> = {
  title: "Zyra/Components/RadioInput",
    component: RadioInput,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RadioInput>;

const commonProps = {
    wrapperClass: "settings-form-group-radio",
    inputWrapperClass: "radio-input-label-wrap",
    inputClass: "setting-form-input",
    descClass: "settings-metabox-description",
    activeClass: "radio-select-active",
    onChange: ( e ) => {
        console.log( "Radio changed:", e.target.value );
    },
};

export const TestRadioInput : Story = {
    args : {
        description: "Choose your preferred theme color.",
        value: "dark",
        name: "themeColor",
        type: "default" as "default",
        keyName: "themeColorOption",
        options: [
            {
                key: "light",
                name: "themeColor",
                value: "light",
                label: "Light Mode",
            },
            {
                key: "dark",
                name: "themeColor",
                value: "dark",
                label: "Dark Mode",
            },
            {
                key: "custom",
                name: "themeColor",
                value: "custom",
                label: "Custom Theme",
            },
        ],
        proSetting: false,
        ...commonProps,
    },
    render:(args)=>{
        return <RadioInput { ...args } />;
    }
};

export const TestRadioSelectInput : Story = {
    args : {
        description: "Select store banner style",
        name: "Banaer",
        type: "radio-select" as "radio-select",
        keyName: "sample_radio_select",
        options: [
            {
                key: "option1",
                name: "Banaer",
                label: "Outer Space",
                value: "template1",
                color: "#",
            },
            {
                key: "option2",
                name: "Banner",
                label: "Green Lagoon",
                value: "template2",
                color: "#",
            },
        ],
        proSetting: false,
        ...commonProps,
    },
    render:(args)=>{
        return (
            <RadioInput key={ "sample_radio_select" } { ...args } />
        );
    }
};

export const TestRadioColorInput : Story = {
    args : {
        description: "This is a simple radio color input",
        name: "Radio Color",
        type: "radio-color" as "radio-color",
        keyName: "sample_radio_color",
        options: [
            {
                key: "option1",
                name: "Radio Color",
                label: "Blue Shades",
                value: "option1",
                color: [ "#202528", "#333b3d", "#3f85b9", "#316fa8" ],
            },
            {
                key: "option2",
                name: "Radio Color",
                label: "Green Shades",
                value: "option2",
                color: [ "#171717", "#212121", "#009788", "#00796a" ],
            },
        ],
        proSetting: false,
        ...commonProps,
    },
    render:(args)=>{
        return (
            <RadioInput key={ "sample_radio_color" } { ...args } />
        );
    }
};
