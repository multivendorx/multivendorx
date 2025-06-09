import BasicInput from "../src/components/BasicInput";
import { ChangeEvent, FocusEvent, MouseEvent } from "react";
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof BasicInput> = {
  title: "Zyra/Components/BasicInput",
  component: BasicInput,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof BasicInput>;

const commonArgs = {
    wrapperClass: "setting-form-input",
    descClass: "settings-metabox-description",
    onChange: ( e: ChangeEvent< HTMLInputElement > ) => {
        console.log( "Changed:", e.target.value );
    },
    onClick: ( e: MouseEvent< HTMLInputElement > ) => {
        console.log( "Clicked:", e.target );
    },
    onMouseOver: ( e: MouseEvent< HTMLInputElement > ) => {
        console.log( "Mouse over:", e.target );
    },
    onMouseOut: ( e: MouseEvent< HTMLInputElement > ) => {
        console.log( "Mouse out:", e.target );
    },
    onFocus: ( e: FocusEvent< HTMLInputElement > ) => {
        console.log( "Focused:", e.target );
    },
};

export const TestBasicInputTextFree: Story = {
    args: {
        type: "text" as "text",
        description:
            "This is a simple text box (text, url, email, password, number)",
        placeholder: "write something",
        ...commonArgs,
    },
    render:(args)=>{
        return (
            <BasicInput key={ "sample_text" } { ...args } />
        );
    }
};

export const TestBasicInputTextPro: Story = {
    args: {
        type: "text" as const,
        description: "This is a simple text box with parameter",
        parameter: "days",
        proSetting: true,
        ...commonArgs,
    },
    render:(args)=>{
        return(
            <BasicInput key={ "sample_parameter_text" } { ...args } />
        );
    }
};

export const TestBasicInputNormalFile: Story = {
    args : {
        type: "file" as const,
        inputClass: "setting-form-input",
        description: "This is a simple file input",
        ...commonArgs,
    },
    render:(args)=>{
        return <BasicInput key={ "sample_normal_file" } { ...args } />
    }
};

export const TestBasicInputColor : Story = {
    args: {
        wrapperClass: "settings-color-picker-parent-class",
        inputClass: "setting-color-picker",
        descClass: "settings-metabox-description",
        type: "color" as "color",
        description: "This is a simple color",
        onChange: ( e: ChangeEvent< HTMLInputElement > ) => {
            console.log( "Changed:", e.target.value );
        },
        onClick: ( e: MouseEvent< HTMLInputElement > ) => {
            console.log( "Clicked:", e.target );
        },
        onMouseOver: ( e: MouseEvent< HTMLInputElement > ) => {
            console.log( "Mouse over:", e.target );
        },
        onMouseOut: ( e: MouseEvent< HTMLInputElement > ) => {
            console.log( "Mouse out:", e.target );
        },
        onFocus: ( e: FocusEvent< HTMLInputElement > ) => {
            console.log( "Focused:", e.target );
        },
    },
    render:(args)=>{
        return <BasicInput key={ "sample_color" } { ...args } />
    }
};

export const TestBasicInputRange : Story = {
    args: {
        type: "range" as "range",
        inputLabel: "Range Input",
        rangeUnit: "px",
        ...commonArgs,
    },
    render:(args)=>{
        return <BasicInput key={ "sample_range" } { ...args } />;
    }
};

export const TestBasicInputButton : Story = {
    args : {
        wrapperClass: "settings-basic-input-class",
        inputClass: "btn default-btn",
        descClass: "settings-metabox-description",
        type: "button" as "button",
        description: "This is a simple button",
        placeholder: "write something",
        onClick: ( e: MouseEvent< HTMLInputElement > ) => {
            console.log( "Button clicked:", e.target );
        },
    },
    render:(args)=>{
        return <BasicInput key={ "sample_button" } { ...args } />
    }
};
