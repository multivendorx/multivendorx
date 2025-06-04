import Support from "../src/components/Support";

export default {
    title: "Zyra/Components/Support",
    component: Support,
};

export const TestSupport = () => {
    const demoSupprotProps = {
        url: "https://support.example.com",
        title: "Need Help?",
        subTitle: "Find answers to common questions below.",
        faqData: [
            {
            question: "How do I reset my password?",
            answer: "Click on 'Forgot password' at the login screen and follow the instructions.",
            open: false,
            },
            {
            question: "Where can I access my account settings?",
            answer: "Go to the dashboard and click on your profile icon to access settings.",
            open: false,
            },
        ],
    };

    return <Support {...demoSupprotProps} />;
};

