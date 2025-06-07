import CalendarInput from "../src/components/CalendarInput";
import "./global.scss";

export default {
    title: "Zyra/Components/CalendarInput",
    component: CalendarInput,
};

export const TestMultipleCalendarRange = () => {
    const demoCalendarInputProps = {
        wrapperClass: "settings-calender",
        inputClass: "teal",
        format: "YYYY-MM-DD",
        description: "This is a simple calender",
        multiple: true,
        range: true,
        value: "",
        onChange: ( date ) => {
            console.log( "Date selected:", date );
        },
    };

    return (
        <CalendarInput
            key={ "sample_multiple_calender_range" }
            { ...demoCalendarInputProps }
        />
    );
};

export const TestMultipleCalendar = () => {
    const demoCalendarInputProps = {
        wrapperClass: "settings-calender",
        inputClass: "teal",
        description: "This is a simple calender",
        format: "YYYY-MM-DD",
        multiple: true,
        value: "",
        onChange: ( date ) => {
            console.log( "Date selected:", date );
        },
    };

    return (
        <CalendarInput
            key={ "sample_multiple_calender" }
            { ...demoCalendarInputProps }
        />
    );
};

export const TestSingleCalendar = () => {
    const demoCalendarInputProps = {
        wrapperClass: "settings-calender",
        inputClass: "teal",
        description: "This is a simple calender",
        format: "YYYY-MM-DD",
        value: "",
        onChange: ( date ) => {
            console.log( "Date selected:", date );
        },
    };

    return (
        <CalendarInput
            key={ "sample_single_calender" }
            { ...demoCalendarInputProps }
        />
    );
};
