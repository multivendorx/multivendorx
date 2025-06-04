import TimePicker from "../src/components/TimePicker";

export default {
    title: "Zyra/Components/TimePicker",
    component: TimePicker,
};

export const TestTimePicker = () => {
    const demoTimePickerProps = {
        formField: {
            label: "Select Time",
        },
        onChange: ( field, value ) => {
            console.log( `Field: ${ field }, Value: ${ value }` );
        },
    };
    return <TimePicker { ...demoTimePickerProps } />;
};
