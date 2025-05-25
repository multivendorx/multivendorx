import { useLocation } from "react-router-dom";

import Settings from "./components/Settings/Settings";
import { ModuleProvider } from "./contexts/ModuleContext";
import SubscribersList from "./components/SubscriberList/SubscribersList";
import ManageStock from "./components/Managestock/Managestock";
import Import from "./components/Managestock/ImportExport/Import";
import Export from "./components/Managestock/ImportExport/Export";

// for react tour
// import { TourProvider } from '@reactour/tour';
// import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
// import Tour from './components/TourSteps/Settings/TourSteps';

// const disableBody = (target: Element | null): void => {
//     if (target instanceof HTMLElement) {
//         disableBodyScroll(target);
//     }
// };
// const enableBody = (target: Element | null): void => {
//     if (target instanceof HTMLElement) {
//         enableBodyScroll(target);
//     }
// };

// for test

const Route = () => {
    const currentTab = new URLSearchParams(useLocation().hash);
    console.log("current tab : ",currentTab.get('tab'));
    return (
        <>
            {currentTab.get("tab") === "settings" && (
                <Settings id={"settings"} />
            )}
            {currentTab.get("tab") === "subscribers-list" && (
                <SubscribersList />
            )}
            {currentTab.get("tab") === "manage-stock" && <ManageStock />}
            {currentTab.get("tab") === "import" && <Import />}
            {currentTab.get("tab") === "export" && <Export />}
        </>
    );
};

const App = () => {
    const currentTabParams = new URLSearchParams(useLocation().hash);
    const location = useLocation();
    console.log("render app...");
    document
        .querySelectorAll("#toplevel_page_notifima>ul>li>a")
        .forEach((menuItem) => {
            const menuItemUrl = new URL((menuItem as HTMLAnchorElement).href);
            const menuItemHashParams = new URLSearchParams(
                menuItemUrl.hash.substring(1)
            );

            if (menuItem.parentNode) {
                (menuItem.parentNode as HTMLElement).classList.remove(
                    "current"
                );
            }
            if (menuItemHashParams.get("tab") === currentTabParams.get("tab")) {
                (menuItem.parentNode as HTMLElement).classList.add("current");
            }
        });

    return (
        <>
            <ModuleProvider
                modules={(window as any).appLocalizer?.active_modules || []}
            >
                {/*this is for tour provider */}
                {/* <TourProvider
                    steps={[]}
                    afterOpen={disableBody}
                    beforeClose={enableBody}
                    disableDotsNavigation={true}
                    showNavigation={false}
                    showCloseButton= {false}
                >
                    <Tour />
                </TourProvider> */}
                <Route key={location.key} />
            </ModuleProvider>
        </>
    );
};

export default App;
