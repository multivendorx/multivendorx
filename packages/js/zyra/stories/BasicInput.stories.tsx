import BasicInput from "../src/components/BasicInput";
import { ChangeEvent, FocusEvent, MouseEvent } from "react";

export default {
    title: "Zyra/Components/BasicInput",
    component: BasicInput,
};

export const TestBasicInputInput = () => {
    const basicInputProps = {
        wrapperClass: "input-wrapper",
        inputLabel: "Username",
        inputClass: "input-field",
        id: "username",
        type: "text" as const,
        name: "username",
        value: "john_doe",
        placeholder: "Enter your username",
        min: 3,
        max: 15,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
            console.log("Changed:", e.target.value);
        },
        onClick: (e: MouseEvent<HTMLInputElement>) => {
            console.log("Clicked:", e.target);
        },
        onMouseOver: (e: MouseEvent<HTMLInputElement>) => {
            console.log("Mouse over:", e.target);
        },
        onMouseOut: (e: MouseEvent<HTMLInputElement>) => {
            console.log("Mouse out:", e.target);
        },
        onFocus: (e: FocusEvent<HTMLInputElement>) => {
            console.log("Focused:", e.target);
        },
        parameter: "user_input",
        proSetting: false,
        description: "Please enter a valid username.",
        descClass: "input-description",
        rangeUnit: "characters",
        disabled: false,
    };

    return <BasicInput {...basicInputProps} />;
};
