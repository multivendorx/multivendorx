import MapsInput from "../src/components/MapsInput";

export default {
    title: "Zyra/Components/MapsInput",
    component: MapsInput,
};

export const TestMapsInput = () => {
    const demoMapsInput = {
        wrapperClass: "maps-input-wrapper",
        containerId: "demo-maps-container",
        containerClass: "demo-maps-container",
        proSetting: true,
        description: "This is a demo MapsInput component.",
        descClass: "maps-input-description",
        Lat: 37.7749, // Example latitude
        Lng: -122.4194, // Example longitude
    };

    return <MapsInput {...demoMapsInput} />;
};