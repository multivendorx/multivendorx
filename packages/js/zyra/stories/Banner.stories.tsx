import Banner from "../src/components/Banner";

export default {
    title: "Zyra/Components/Banner",
    component: Banner,
};

export const TestBannerInput = () => {
    const props = {
        is_pro: false,
        products: [
            {
                title: "Pro Feature 1",
                description: "Description for Pro Feature 1",
            },
            {
                title: "Pro Feature 2",
                description: "Description for Pro Feature 2",
            },
            {
                title: "Pro Feature 3",
                description: "Description for Pro Feature 3",
            },
        ],
        pro_url: "#",
    };

    return <Banner { ...props } />;
};
