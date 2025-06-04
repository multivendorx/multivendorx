(globalThis as any).appLocalizer = {
    khali_dabba: false,
};

import Managestock from "../components/Managestock/Managestock";
import "zyra/build/index.css";

export default {
    title: "Notifima/Components/Managestock",
    component: Managestock,
};

export const TestFreeManagestock = () => {
    (globalThis as any).appLocalizer.khali_dabba = false;
    return <Managestock />;
};

export const TestProManagestock = () => {
    (globalThis as any).appLocalizer.khali_dabba = true;
    return <Managestock />;
};
