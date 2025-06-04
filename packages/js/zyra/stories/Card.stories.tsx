import Card from "../src/components/Card";

export default {
    title: "Zyra/Components/Card",
    component: Card,
};

export const TestCard = () => {
    const demoCardProps = {
        title: "Demo Card",
        children: <p>This is a sample card content.</p>,
        width: "300px",
        elevation: "medium" as const,
    };

    return <Card {...demoCardProps} />;
};




