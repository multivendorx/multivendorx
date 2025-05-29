import { useLocation } from "react-router-dom";

import Settings from "./components/Settings/Settings";
import { ModuleProvider } from "./contexts/ModuleContext";
import Synchronization from "./components/Synchronization/Synchronization";
import Courses from "./components/Courses/Courses";
import Cohort from "./components/Cohort/Cohort";
import Enrollment from "./components/Enrollment/Enrollment";

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
    return (
        <>
            { currentTab.get('tab') === 'settings' && (
                <Settings id={"settings"} />
            ) }

            { currentTab.get('tab') === 'synchronization' && (
                <Synchronization id={"synchronization"} />
            ) }
            { currentTab.get('tab') === 'courses' && <Courses /> }
            { currentTab.get('tab') === 'enrolments' && <Enrollment /> }
            { currentTab.get('tab') === 'cohorts' && <Cohort /> }
           
        </>
    );
};

const App = () => {
    const currentTabParams = new URLSearchParams(useLocation().hash);
    document
        .querySelectorAll("#toplevel_page_moowoodle>ul>li>a")
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
                <Route />
            </ModuleProvider>
        </>
    );
};

export default App;
