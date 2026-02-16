import { useEffect, useRef, useState } from 'react';
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
        event: 'click',
        callback: (event: MapboxClickEvent) => void
    ) => void;
}

interface MapboxMarker {
    setLngLat: (lngLat: [number, number]) => MapboxMarker;
    getLngLat: () => { lng: number; lat: number };
    addTo: (map: MapboxMap) => MapboxMarker;
    on: (event: 'dragend', callback: () => void) => void;
}

interface MapboxClickEvent {
    lngLat: { lat: number; lng: number };
}

declare global {
    interface Window {
        mapboxgl: {
            accessToken: string;
            Map: new (options: {
                container: HTMLElement;
                style: string;
                center: [number, number];
                zoom: number;
                attributionControl: boolean;
            }) => MapboxMap;
            Marker: new (options: {
                draggable: boolean;
                color: string;
            }) => MapboxMarker;
            NavigationControl: new () => unknown;
        };
    }
}

interface SearchboxSuggestion {
    name: string;
    mapbox_id: string;
}

interface SearchboxSuggestResponse {
    suggestions: SearchboxSuggestion[];
}

interface PlaceFeature {
    geometry: {
        coordinates: [number, number];
    };
    properties: {
        full_address: string;
        name?: string;
        context?: AddressContext;
    };
}

interface RetrieveResponse {
    features: PlaceFeature[];
}

interface ReverseGeocodeResponse {
    features: PlaceFeature[];
}

interface Store {
    id: number;
    store_name: string;
    address_1?: string;
    location_lat?: string;
    location_lng?: string;
}

interface MapboxComponentProps {
    apiKey: string;
    locationAddress: string;
    locationLat: string;
    locationLng: string;
    isUserLocation?: boolean;
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
    instructionText: string;
    placeholderSearch: string;
    stores: { data: Store[] } | null;
}

interface ContextItem {
    name?: string;
    address_number?: string;
    street_name?: string;
    country_code?: string;
    region_code?: string;
}

interface AddressContext {
    address?: ContextItem;
    street?: ContextItem;
    neighborhood?: ContextItem;
    postcode?: ContextItem;
    locality?: ContextItem;
    place?: ContextItem;
    district?: ContextItem;
    region?: ContextItem;
    country?: ContextItem;
}


const Mapbox = ({
    apiKey,
    locationLat,
    locationLng,
    isUserLocation,
    onLocationUpdate,
    labelSearch,
    instructionText,
    placeholderSearch,
}: MapboxComponentProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const [map, setMap] = useState<MapboxMap | null>(null);
    const [marker, setMarker] = useState<MapboxMarker | null>(null);
    const [loaded, setLoaded] = useState(false);

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchboxSuggestion[]>([]);

    const sessionTokenRef = useRef<string>(
        Math.random().toString(36).substring(2)
    );

    useEffect(() => {
        if (window.mapboxgl) {
            setLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src =
            'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.js';

        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href =
            'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.css';

        script.onload = () => setLoaded(true);

        document.head.appendChild(script);
        document.head.appendChild(css);
    }, []);

    useEffect(() => {
        if (!loaded || !mapContainerRef.current) return;

        window.mapboxgl.accessToken = apiKey;

        const lat = parseFloat(locationLat) || 40.7128;
        const lng = parseFloat(locationLng) || -74.006;

        const map = new window.mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/standard',
            center: [lng, lat],
            zoom: locationLat ? 15 : 10,
            attributionControl: false,
        });
        map.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
        const mk = new window.mapboxgl.Marker({
            draggable: true,
            color: isUserLocation ? '#1E90FF' : '#4264FB',
        })
            .setLngLat([lng, lat])
            .addTo(map);
        mk.on('dragend', () => {
            const ll = mk.getLngLat();
            reverseGeocode(ll.lat, ll.lng);
        });
        map.on('click', (e) => {
            reverseGeocode(e.lngLat.lat, e.lngLat.lng);
        });
        setMap(map);
        setMarker(mk);
        return () => map.remove();
    }, [loaded, apiKey, locationLat, locationLng, isUserLocation]);

    const fetchSuggestions = async (text: string) => {
        if (!text) {
            setSuggestions([]);
            return;
        }
        const url =
            `https://api.mapbox.com/search/searchbox/v1/suggest` +
            `?q=${encodeURIComponent(text)}` +
            `&access_token=${apiKey}` +
            `&session_token=${sessionTokenRef.current}`;
        const res = await fetch(url);
        const data: SearchboxSuggestResponse = await res.json();
        setSuggestions(data.suggestions || []);
    };

    const selectSuggestion = async (suggestion: SearchboxSuggestion) => {
        const url =
            `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}` +
            `?access_token=${apiKey}` +
            `&session_token=${sessionTokenRef.current}`;

        const res = await fetch(url);
        const data: RetrieveResponse = await res.json();
        console.log('data', data);
        const feature = data.features[0];
        if (!feature) return;
        handlePlaceSelect(feature);
        setQuery(feature.properties.full_address);
        setSuggestions([]);
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        const url =
            `https://api.mapbox.com/search/geocode/v6/reverse` +
            `?longitude=${lng}&latitude=${lat}` +
            `&access_token=${apiKey}`;
        const res = await fetch(url);
        const data: ReverseGeocodeResponse = await res.json();
        const feature = data.features[0];
        if (!feature) return;
        handlePlaceSelect(feature);
    };

    const handlePlaceSelect = (feature: PlaceFeature) => {
        const [lng, lat] = feature.geometry.coordinates;
        if (map && marker) {
            map.setCenter([lng, lat]);
            marker.setLngLat([lng, lat]);
            map.setZoom(17);
        }
        const components = extractAddressComponents(feature);
        onLocationUpdate({
            location_address: feature.properties.full_address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
            ...components,
        });
    };

    const extractAddressComponents = (feature: PlaceFeature) => {
        console.log('feature', feature);
        const ctx = feature.properties.context;
        const result: {
            address?: string;
            city?: string;
            state?: string;
            country?: string;
            zip?: string;
        } = {};
        if (!ctx) return result;
        result.address = feature.properties.full_address;
        result.zip = ctx.postcode? ctx.postcode.name : '';
        result.city = ctx.locality? ctx.locality.name : ctx.place?.name;
        result.state = ctx.region? ctx.region.name : '';
        result.country = ctx.country? ctx.country.country_code : '';
        return result;
    };    

    return (
        <FormGroup label={labelSearch}>
            <div
                ref={mapContainerRef}
                style={{ position: 'relative', height: 400 }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 5,
                        width: 260,
                        background: '#fff',
                        borderRadius: 6,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                >
                    <input
                        value={query}
                        placeholder={placeholderSearch}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            fetchSuggestions(e.target.value);
                        }}
                        style={{
                            width: '100%',
                            padding: 8,
                            border: 'none',
                            outline: 'none',
                        }}
                    />
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.mapbox_id}
                            onClick={() => selectSuggestion(suggestion)}
                            style={{
                                padding: 8,
                                cursor: 'pointer',
                                borderTop: '1px solid #eee',
                            }}
                        >
                            {suggestion.name}
                        </div>
                    ))}
                </div>
            </div>

            <span className="settings-metabox-description">
                {instructionText}
            </span>
        </FormGroup>
    );
};

export default Mapbox;
