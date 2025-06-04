import Heading from "../src/components/Heading";

export default {
    title: "Zyra/Components/Heading",
    component: Heading,
};

export const TestHeading = () => {
    const headingProps = {
        wrapperClass: "heading-container",
        blocktext: "Welcome to the Heading Component",
    };

    return <Heading { ...headingProps } />;
};
