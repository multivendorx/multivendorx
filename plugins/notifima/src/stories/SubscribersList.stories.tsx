(globalThis as any).appLocalizer = {
    khali_dabba: false,
};

import SubscribersList from "../components/SubscriberList/SubscribersList";
import "zyra/build/index.css";

export default {
    title: "Notifima/Components/SubscribersList",
    component: SubscribersList,
};

export const TestFreeSubscribersList = () => {
    (globalThis as any).appLocalizer.khali_dabba = false;
    return <SubscribersList />;
};

export const TestProSubscribersList = () => {
    (globalThis as any).appLocalizer.khali_dabba = true;
    return <SubscribersList />;
};
