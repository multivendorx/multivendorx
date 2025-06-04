import Button from "../src/components/Button";


export default{
    title: "Zyra/Components/Button",
    component: Button,
}

export const TestSubmitButton =()=>{
    const demoButtonProps = {
        wrapperClass: "btn-wrapper",
        inputClass: "btn-input",
        type: "submit" as const,
        value: "Click Me",
        onClick: (e) => {
            console.log("Button clicked", e);
        },
        proSetting: true,
        description: "This is a Pro feature",
        descClass: "btn-desc",
    };
    return <Button {...demoButtonProps} />
}

export const TestResetButton =()=>{
    const demoButtonProps = {
        wrapperClass: "btn-wrapper",
        inputClass: "btn-input",
        type: "reset" as const,
        value: "Click Me",
        onClick: (e) => {
            console.log("Button clicked", e);
        },
        proSetting: true,
        description: "This is a Pro feature",
        descClass: "btn-desc",
    };
    return <Button {...demoButtonProps} />
}

export const TestButton =()=>{
    const demoButtonProps = {
        wrapperClass: "btn-wrapper",
        inputClass: "btn-input",
        type: "button" as const,
        value: "Click Me",
        onClick: (e) => {
            console.log("Button clicked", e);
        },
        proSetting: true,
        description: "This is a Pro feature",
        descClass: "btn-desc",
    };
    return <Button {...demoButtonProps} />
}