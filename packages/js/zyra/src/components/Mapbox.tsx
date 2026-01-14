import { useEffect, useRef, useState } from 'react';
import FormGroupWrapper from './UI/FormGroupWrapper';
import FormGroup from './UI/FormGroup';

interface MapboxControl {
    onAdd: (map: MapboxMap) => HTMLElement;
    onRemove?: () => void;
}

interface MapboxMap {
    setCenter: (center: [number, number]) => void;
    setZoom: (zoom: number) => void;
    remove: () => void;
    addControl: (control: MapboxControl, position?: string) => void;
    on: (
        event: string,
        callback: (event: MapboxClickEvent) => void
    ) => void;
    _removed?: boolean;
}

interface MapboxMarker {
    setLngLat: (lngLat: [number, number]) => MapboxMarker;
    getLngLat: () => { lng: number; lat: number };
    on: (event: string, callback: () => void) => void;
}

interface MapboxClickEvent {
    lngLat: { lat: number; lng: number };
}

interface MapboxGeocoderResult {
    center: [number, number];
    place_name: string;
    properties?: { address?: string };
    context?: Array<{
        id: string;
        text: string;
        short_code?: string;
    }>;
}

declare global {
    interface Window {
        mapboxgl: {
            Map: new (options: {
                container: HTMLDivElement;
                style: string;
                center: [number, number];
                zoom: number;
                attributionControl: boolean;
            }) => MapboxMap;
            Marker: new (options?: {
                draggable: boolean;
                color: string;
            }) => MapboxMarker;
            NavigationControl: new () => MapboxControl;
            accessToken: string;
        };
        MapboxGeocoder: new (options: {
            accessToken: string;
            mapboxgl: Window['mapboxgl'];
            marker: boolean;
            placeholder: string;
            proximity: [number, number];
        }) => {
            onAdd: (map: MapboxMap) => HTMLElement;
            on: (
                event: string,
                callback: (event: { result: MapboxGeocoderResult }) => void
            ) => void;
        };
    }
}

interface MapboxComponentProps {
    apiKey: string;
    locationAddress: string;
    locationLat: string;
    locationLng: string;
    onLocationUpdate: (data: {
        location_address: string;
        location_lat: string;
        location_lng: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
    }) => void;
    labelSearch: string;
    labelMap: string;
    instructionText: string;
    placeholderSearch: string;
}

const Mapbox = ({
    apiKey,
    locationLat,
    locationLng,
    onLocationUpdate,
    labelSearch,
    labelMap,
    instructionText,
    placeholderSearch,
}: MapboxComponentProps) => {
    const [map, setMap] = useState<MapboxMap | null>(null);
    const [marker, setMarker] = useState<MapboxMarker | null>(null);
    const [mapboxLoaded, setMapboxLoaded] = useState<boolean>(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const geocoderContainerRef = useRef<HTMLDivElement>(null);

    // Load Mapbox script
    useEffect(() => {
        if (window.mapboxgl) {
            setMapboxLoaded(true);
            return;
        }

        // Load Mapbox GL JS
        const mapboxGlScript = document.createElement('script');
        mapboxGlScript.src =
            'https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.js';
        mapboxGlScript.async = true;

        const mapboxGlCss = document.createElement('link');
        mapboxGlCss.href =
            'https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.css';
        mapboxGlCss.rel = 'stylesheet';

        // Load Mapbox Geocoder
        const mapboxGeocoderScript = document.createElement('script');
        mapboxGeocoderScript.src =
            'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.min.js';
        mapboxGeocoderScript.async = true;

        const mapboxGeocoderCss = document.createElement('link');
        mapboxGeocoderCss.href =
            'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.2/mapbox-gl-geocoder.css';
        mapboxGeocoderCss.rel = 'stylesheet';

        mapboxGlScript.onload = () => {
            // Load geocoder after mapbox is loaded
            document.head.appendChild(mapboxGeocoderScript);
            document.head.appendChild(mapboxGeocoderCss);
            mapboxGeocoderScript.onload = () => {
                setMapboxLoaded(true);
            };
        };

        document.head.appendChild(mapboxGlScript);
        document.head.appendChild(mapboxGlCss);

        return () => {
            // Cleanup function
            document.head.removeChild(mapboxGlScript);
            document.head.removeChild(mapboxGlCss);
            if (document.head.contains(mapboxGeocoderScript)) {
                document.head.removeChild(mapboxGeocoderScript);
            }
            if (document.head.contains(mapboxGeocoderCss)) {
                document.head.removeChild(mapboxGeocoderCss);
            }
        };
    }, []);

    // Initialize map when Mapbox is loaded
    useEffect(() => {
        if (
            !mapboxLoaded ||
            !mapContainerRef.current ||
            !geocoderContainerRef.current
        ) {
            return;
        }

        window.mapboxgl.accessToken = apiKey;

        const initialLat = parseFloat(locationLat) || 40.7128;
        const initialLng = parseFloat(locationLng) || -74.006;

        // Clear previous map if exists
        if (map && !map._removed) {
            map._removed = true;
            map.remove();
        }

        const mapInstance = new window.mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [initialLng, initialLat],
            zoom: locationLat ? 15 : 10,
            attributionControl: false,
        });

        // Add navigation controls
        mapInstance.addControl(
            new window.mapboxgl.NavigationControl(),
            'top-right'
        );

        const markerInstance = new window.mapboxgl.Marker({
            draggable: true,
            color: '#4264FB',
        })
            .setLngLat([initialLng, initialLat])
            .addTo(mapInstance);

        markerInstance.on('dragend', () => {
            const lngLat = markerInstance.getLngLat();
            reverseGeocode(lngLat.lat, lngLat.lng);
        });

        mapInstance.on('click', (event: MapboxClickEvent) => {
            reverseGeocode(event.lngLat.lat, event.lngLat.lng);
        });

        // Initialize geocoder
        const geocoder = new window.MapboxGeocoder({
            accessToken: apiKey,
            mapboxgl: window.mapboxgl,
            marker: false,
            placeholder: placeholderSearch,
            proximity: [initialLng, initialLat],
        });

        geocoder.on('result', (e: { result: MapboxGeocoderResult }) => {
            handlePlaceSelect(e.result);
        });

        // Clear previous geocoder content
        geocoderContainerRef.current.innerHTML = '';
        geocoderContainerRef.current.appendChild(
            geocoder.onAdd(mapInstance)
        );

        setMap(mapInstance);
        setMarker(markerInstance);

        return () => {
            if (mapInstance) {
                mapInstance.remove();
            }
        };
    }, [mapboxLoaded, locationLat, locationLng, apiKey]);

    const handlePlaceSelect = (place: MapboxGeocoderResult) => {
        const lng = place.center[0];
        const lat = place.center[1];
        const formatted_address = place.place_name;
        const addressComponents = extractAddressComponents(place);

        if (map && marker) {
            map.setCenter([lng, lat]);
            marker.setLngLat([lng, lat]);
            map.setZoom(17);
        }

        const newLocationData = {
            location_address: formatted_address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
            ...addressComponents,
        };

        if (!newLocationData.address && formatted_address) {
            newLocationData.address = formatted_address;
        }

        onLocationUpdate(newLocationData);
    };

    const reverseGeocode = (lat: number, lng: number) => {
        fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${apiKey}`
        )
            .then((response) => response.json())
            .then((data: { features: MapboxGeocoderResult[] }) => {
                if (data.features && data.features.length > 0) {
                    handlePlaceSelect(data.features[0]);
                }
            });
    };

    const extractAddressComponents = (place: MapboxGeocoderResult) => {
        const components: {
            address?: string;
            city?: string;
            state?: string;
            country?: string;
            zip?: string;
        } = {};

        if (place.properties) {
            components.address = place.properties.address || '';
        }

        if (place.context) {
            place.context.forEach(
                (component: {
                    id: string;
                    text: string;
                    short_code?: string;
                }) => {
                    const idParts = component.id.split('.');
                    const type = idParts[0];

                    if (type === 'postcode') {
                        components.zip = component.text;
                    } else if (type === 'place') {
                        components.city = component.text;
                    } else if (type === 'region') {
                        components.state = component.text;
                    } else if (type === 'country') {
                        components.country = component.short_code.toUpperCase();
                    }
                }
            );
        }

        return components;
    };

    return (
        <>
            <FormGroup label={labelSearch}>
                <div
                    ref={mapContainerRef}
                    id="location-map"
                >
                    <div
                        ref={geocoderContainerRef}
                        id="store-location-autocomplete-container"
                    ></div>
                </div>
                <span className="settings-metabox-description">
                    {instructionText}
                </span>
            </FormGroup>
        </>
    );
};

export default Mapbox;
