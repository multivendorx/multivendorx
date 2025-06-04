import AdminFooter from "../src/components/AdminFooter";

export default {
    title: "Zyra/Components/AdminFooter",
    component: AdminFooter,
};

export const TestAdminFooter = () => {
    const supportLink = [
        {
            title: "This is admin footer 1",
            icon: "adminLib-person",
            description: "This is admin footer description 1",
            link: "#",
        },
        {
            title: "This is admin footer 2",
            icon: "lock",
            description: "This is admin footer description 2",
            link: "#",
        },
        {
            title: "This is admin footer 3",
            icon: "lock",
            description: "This is admin footer description 3",
            link: "#",
        },
    ];
    return <AdminFooter supportLink={supportLink} />;
};
