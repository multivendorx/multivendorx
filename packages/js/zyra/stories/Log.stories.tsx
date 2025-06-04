import Log from "../src/components/Log";

export default {
    title: "Zyra/Components/Log",
    component: Log,
};

export const TestLog = () => {
    const demoLogProps = {
        apiLink: "https://api.example.com/logs",
        downloadFileName: "app-log.txt",
        appLocalizer: {
            locale: "en-US",
            timezone: "UTC",
        },
    };

    return <Log {...demoLogProps} />;
};


