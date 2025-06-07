(globalThis as any).appLocalizer = {
    google_api: 'AIzaSyBNIfvjxTlKFU6ERNIYtFdI70hfwPpev-Q',
};

import GoogleMap from "../src/components/GoogleMap";

export default {
    title: "Zyra/Components/GoogleMap",
    component: GoogleMap,
};

export const TestGoogleMap = () => {
    const demoGoogleMapProps = {
        center: { lat: 37.7749, lng: -122.4194 },
        wrapperClass: "map-container",
        placeholder: "Loading map...",
    };

    return <GoogleMap { ...demoGoogleMapProps } />;
};
