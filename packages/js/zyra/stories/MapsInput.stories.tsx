( globalThis as any ).appLocalizer = {
    khali_dabba: false,
    mapbox_api:
        "pk.eyJ1Ijoic2FuZ2l0YTIwMiIsImEiOiJjbTJ2amp3aGkwYmZhMmpxeDlmNDZqM2x0In0.8ZyMg2mfyq3ex81-n_MQ8w",
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
