import Datepicker from "../src/components/DatePicker";

export default {
    title: "Zyra/Components/Form/DatePicker",
    component: Datepicker,
};

export const TestDatepicker = () => {
    const demoDatepickerProps = {
        formField: {
            label: "Select Date",
        },
        onChange: ( field, value ) => {
            console.log( `Changed ${ field } to ${ value }` );
        },
    };

    return <Datepicker { ...demoDatepickerProps } />;
};
