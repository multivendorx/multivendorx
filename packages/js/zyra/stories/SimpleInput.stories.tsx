import SimpleInput from "../src/components/SimpleInput";

export default {
    title: "Zyra/Components/SimpleInput",
    component: SimpleInput,
};

export const TestSimpleInput = () => {
    const demoSimpleInputProps = {
        formField: {
            label: "Email",
            placeholder: "Enter your email",
        },
        onChange: ( field, value ) => {
            console.log( `Field ${ field } changed to`, value );
        },
    };

    return <SimpleInput { ...demoSimpleInputProps } />;
};
