import BasicInput from "../src/components/BasicInput";
import { ChangeEvent, FocusEvent, MouseEvent } from "react";
import "../src/styles/web/AdminForm.scss"

export default {
    title: "Zyra/Components/BasicInput",
    component: BasicInput,
};

const commonArgs = {
    wrapperClass: "setting-form-input",
    descClass: "input-description",
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

export const TestBasicInputTextFree = () => {
    const basicInputProps = {
        type: "text" as "text",
        label: 'Sample Text Box', 
        description: "This is a simple text box (text, url, email, password, number)",
        placeholder: "write something",
        ...commonArgs,
    };

    return <BasicInput key={"sample_text"} { ...basicInputProps } />;
};

export const TestBasicInputTextPro = () => {
    const basicInputProps = {
        type: "text" as const,
        label: 'Sample Text Box with parameter', 
        description: "This is a simple text box with parameter",
        parameter: 'days',
        proSetting: true,
        ...commonArgs,
    };

    return <BasicInput key={"sample_parameter_text"} { ...basicInputProps } />;
};

export const TestBasicInputNormalFile = () => {
    const basicInputProps = {
        type: "file" as const,
        label: "Sample normal file",
        description: "This is a simple file input",
        ...commonArgs,
    };

    return <BasicInput key={"sample_normal_file"} { ...basicInputProps } />;
};

export const TestBasicInputColor = () => {
    const basicInputProps = {
        wrapperClass: "settings-color-picker-parent-class",
        inputClass: "setting-color-picker",
        descClass: "settings-metabox-description",
        type: "color" as "color",
        label: 'Sample Color', 
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
    };

    return <BasicInput key={"sample_color"} { ...basicInputProps } />;
};


export const TestBasicInputRange = () => {
    const basicInputProps = {
        type: "range" as "range",
        label: 'Sample Range',
        inputLabel: "Range Input",
        rangeUnit: 'px',
        ...commonArgs,
    };

    return <BasicInput key={"sample_range"} { ...basicInputProps } />;
};


export const TestBasicInputButton = () => {
    const basicInputProps = {
        wrapperClass: "settings-basic-input-class",
        inputClass: "btn default-btn",
        descClass: "settings-metabox-description",
        type: "button" as "button",
        label: 'Sample button', 
        desc: "This is a simple button",
        placeholder: "write something",
        onClick: ( e: MouseEvent< HTMLInputElement > ) => {
            console.log( "Button clicked:", e.target );
        },
    };

    return <BasicInput key={"sample_button"} { ...basicInputProps } />;
};