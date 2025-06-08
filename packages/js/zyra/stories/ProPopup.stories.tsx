import ProPopup from "../src/components/ProPopup";

export default {
    title: "Zyra/Components/ProPopup",
    component: ProPopup,
};

export const TestProPopup = () => {
    const demoProPopupProps = {
        proUrl: "https://example.com/upgrade-to-pro",
        title: "Upgrade to Pro",
        messages: [
            "Unlock all advanced features.",
            "Get priority support.",
            "Access to premium modules and integrations.",
        ],
    };

    return <ProPopup { ...demoProPopupProps } />;
};
