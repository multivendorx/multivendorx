import CatalogCustomizer from "../src/components/CatalogCustomizer";

export default {
    title: "Zyra/Components/CatalogCustomizer",
    component: CatalogCustomizer,
};

export const TestCatalogCustomizer = () => {
    const demoCatalogCustomizerProps = {
        onChange: (key, value) => {
            console.log("Catalog change:", key, value);
        },
        proSetting: true,
        setting: {
            layout: "grid",
            showImages: true,
        },
        Sample_Product: "Sample Product Name",
        pro_url: "https://example.com/upgrade",
    };

    return <CatalogCustomizer {...demoCatalogCustomizerProps} />;
};