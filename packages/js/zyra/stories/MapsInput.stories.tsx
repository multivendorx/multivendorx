(globalThis as any).appLocalizer = {
    khali_dabba: false,
};


import MapsInput from "../src/components/MapsInput";

export default {
    title: "Zyra/Components/MapsInput",
    component: MapsInput,
};

export const TestMapsInput = () => {
    const demoMapsInput = {
        wrapperClass: "settings-basic-input-class",
        descClass: "settings-metabox-description",
        description: "This is a simple map",
        containerId: "store-maps",
        containerClass: "store-maps gmap",
        proSetting: false,
        Lat: 37.7749, // Example latitude
        Lng: -122.4194, // Example longitude
    };

    return <MapsInput { ...demoMapsInput } />;
};
