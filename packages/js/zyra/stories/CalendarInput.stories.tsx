import CalendarInput from "../src/components/CalendarInput";

export default {
    title: "Zyra/Components/CalendarInput",
    component: CalendarInput,
};

export const TestCalendarInput = () => {
    const demoCalendarInputProps = {
        wrapperClass: "calendar-wrapper",
        inputClass: "calendar-input",
        format: "YYYY-MM-DD",
        multiple: false,
        range: true,
        value: "2025-06-04",
        onChange: ( date ) => {
            console.log( "Date selected:", date );
        },
        proSetting: true,
    };

    return <CalendarInput { ...demoCalendarInputProps } />;
};
