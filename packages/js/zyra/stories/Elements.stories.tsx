import Elements from "../src/components/Elements";

export default {
    title: "Zyra/Components/Elements",
    component: Elements,
};

export const TestElements = () => {
    const demoElementsProps = {
        selectOptions: [
            { value: "option1", label: "Option 1", icon: "icon-1" },
            { value: "option2", label: "Option 2", icon: "icon-2" },
            { value: "option3", label: "Option 3" },
        ],
        onClick: ( value ) => {
            console.log( "Selected:", value );
        },
    };
    return <Elements { ...demoElementsProps } />;
};
