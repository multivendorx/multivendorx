import CatalogCustomizer from "../src/components/CatalogCustomizer";

export default {
    title: "Zyra/Components/CatalogCustomizer",
    component: CatalogCustomizer,
};

export const TestCatalogCustomizer = () => {
    const demoCatalogCustomizerProps = {
        onChange: ( key, value ) => {
            console.log( "Catalog change:", key, value );
        },
        proSetting: true,
        setting: {
            layout: "grid",
            showImages: true,
        },
        Sample_Product:
            "https://greendroprecycling.com/wp-content/uploads/2017/04/GreenDrop_Station_Aluminum_Can_Coke.jpg",
        pro_url: "https://example.com/upgrade",
    };

    return <CatalogCustomizer { ...demoCatalogCustomizerProps } />;
};
