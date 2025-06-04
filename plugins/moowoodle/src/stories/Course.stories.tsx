(globalThis as any).appLocalizer = {
    apiUrl: "https://example.com/pro-upgrade",
    khali_dabba:false,
};

import Courses from "../components/Courses/Courses";
import "zyra/build/index.css";

export default {
    title: "Moowoodle/Components/Courses",
    component: Courses,
};

export const TestCoursesTableFree = () => {
    return <Courses />;
};

export const TestCoursesTablePro = () => {
    (globalThis as any).appLocalizer.khali_dabba = true;
    return <Courses />;
};
