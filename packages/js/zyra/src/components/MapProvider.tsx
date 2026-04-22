/* global google*/
/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { FieldComponent } from './fieldUtils';

/* ---------------- TYPES ---------------- */

interface Store {
    id: number;
    store_name: string;
    location_lat?: string;
    location_lng?: string;
}

interface MapProviderProps {
    apiKey: string;
    mapId: string;
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
    placeholderSearch: string;
    stores: { data: Store[] } | null;
    mapProvider: string;
}

interface MapboxSuggestion {
    mapbox_id: string;
    name: string;
}

type MapInstance = google.maps.Map | window.mapboxgl.Map;

type MarkerInstance =
    | google.maps.marker.AdvancedMarkerElement
    | window.mapboxgl.Marker;

type MapProviderType = 'google_map' | 'mapbox';
type MarkerType = 'default' | 'user' | 'store';

interface MapAdapter {
    loadScript(apiKey: string): Promise<void>;

    createMap(
        container: HTMLElement,
        lat: number,
        lng: number,
        zoom: number,
        mapId?: string
    ): MapInstance;

    createMarker(
        map: MapInstance,
        lat: number,
        lng: number,
        markerType?: MarkerType
    ): MarkerInstance;

    onDragEnd(
        marker: MarkerInstance,
        cb: (lat: number, lng: number) => void
    ): void;

    onMapClick(map: MapInstance, cb: (lat: number, lng: number) => void): void;

    reverseGeocode(lat: number, lng: number): Promise<unknown>;

    extractAddress(result: unknown): AddressResult;
}

interface MapboxFeature {
    geometry: {
        coordinates: [number, number];
    };
    properties?: {
        full_address?: string;
        context?: {
            place?: { name: string };
            region?: { name: string };
            country?: { country_code: string };
            postcode?: { name: string };
        };
    };
}

interface AddressResult {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    location_address?: string;
}

const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.006 };

/* ---------------- GOOGLE ADAPTER ---------------- */

const googleAdapter: MapAdapter = {
    async loadScript(apiKey: string) {
        if (window.google?.maps) {
            return;
        }

        if (document.getElementById('google-map-script')) {
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-map-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
        script.async = true;
        script.defer = true;

        document.head.appendChild(script);

        await new Promise((res) => (script.onload = res));
    },

    createMap(
        container: HTMLElement,
        lat: number,
        lng: number,
        zoom: number,
        mapId?: string
    ) {
        return new window.google.maps.Map(container, {
            center: { lat, lng },
            zoom,
            mapId: mapId,
        });
    },

    createMarker(
        map: MapInstance,
        lat: number,
        lng: number,
        markerType: MarkerType = 'default',
        title?: string
    ) {
        const position = { lat, lng };

        let content;

        if (markerType === 'store') {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '6px';

            const icon = document.createElement('div');
            icon.style.width = '28px';
            icon.style.height = '28px';
            icon.style.borderRadius = '50%';
            icon.style.background = '#4B96F3';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

            const img = document.createElement('img');
            img.src =
                'https://maps.gstatic.com/mapfiles/place_api/icons/v2/convenience_pinlet.png';
            img.style.width = '16px';

            icon.appendChild(img);

            // 🔹 label
            const label = document.createElement('div');
            label.innerText = title || '';
            label.style.background = 'white';
            label.style.padding = '2px 8px';
            label.style.borderRadius = '6px';
            label.style.fontSize = '12px';
            label.style.fontWeight = '500';
            label.style.whiteSpace = 'nowrap';
            label.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';

            wrapper.appendChild(icon);
            wrapper.appendChild(label);

            content = wrapper;
        } else if (markerType === 'default') {
            const img = document.createElement('img');
            img.src =
                'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png';
            img.style.width = '32px';
            img.style.height = '32px';

            return new google.maps.marker.AdvancedMarkerElement({
                map,
                position,
                content: img,
                gmpDraggable: true,
            });
        } else {
            const markerDiv = document.createElement('div');

            markerDiv.style.width = '16px';
            markerDiv.style.height = '16px';
            markerDiv.style.borderRadius = '50%';

            markerDiv.style.background =
                markerType === 'user' ? '#2563eb' : '#ef4444';

            markerDiv.style.border = '2px solid white';
            markerDiv.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)';

            content = markerDiv;
        }

        return new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content,
            gmpDraggable: markerType !== 'store',
        });
    },

    onDragEnd(marker: MarkerInstance, cb: (lat: number, lng: number) => void) {
        marker.addListener('dragend', (event: any) => {
            const position = event.latLng;
            cb(position.lat(), position.lng());
        });
    },

    onMapClick(map: MapInstance, cb: (lat: number, lng: number) => void) {
        map.addListener('click', (e: google.maps.MapMouseEvent) =>
            cb(e.latLng.lat(), e.latLng.lng())
        );
    },

    async reverseGeocode(lat: number, lng: number) {
        return new Promise((resolve) => {
            new window.google.maps.Geocoder().geocode(
                { location: { lat, lng } },
                (
                    results: google.maps.GeocoderResult[],
                    status: google.maps.GeocoderStatus
                ) => resolve(status === 'OK' ? results[0] : null)
            );
        });
    },

    extractAddress(result: google.maps.GeocoderAddressComponent | null) {
        if (!result) {
            return {};
        }

        const components: Record<string, string> = {};

        result.address_components?.forEach(
            (c: google.maps.GeocoderAddressComponent) => {
                if (c.types.includes('locality')) {
                    components.city = c.long_name;
                }
                if (c.types.includes('administrative_area_level_1')) {
                    components.state = c.long_name;
                }
                if (c.types.includes('country')) {
                    components.country = c.short_name;
                }
                if (c.types.includes('postal_code')) {
                    components.zip = c.long_name;
                }
            }
        );

        return {
            address: result.formatted_address,
            city: components.city,
            state: components.state,
            country: components.country,
            zip: components.zip,
            location_address: result.formatted_address,
        };
    },
};

/* ---------------- MAPBOX ADAPTER ---------------- */

const mapboxAdapter: MapAdapter = {
    async loadScript(apiKey: string) {
        if (window.mapboxgl) {
            window.mapboxgl.accessToken = apiKey;
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.js';

        document.head.appendChild(script);

        await new Promise((r) => (script.onload = r));

        window.mapboxgl.accessToken = apiKey;

        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://api.mapbox.com/mapbox-gl-js/v3.18.1/mapbox-gl.css';

        document.head.appendChild(css);
    },

    createMap(container: HTMLElement, lat: number, lng: number, zoom: number) {
        return new window.mapboxgl.Map({
            container,
            style: 'mapbox://styles/mapbox/standard',
            center: [lng, lat],
            zoom,
        });
    },

    createMarker(
        map: MapInstance,
        lat: number,
        lng: number,
        markerType: MarkerType = 'default'
    ) {
        const color =
            markerType === 'user'
                ? '#2563eb'
                : markerType === 'store'
                  ? '#16a34a'
                  : '#ef4444';

        return new window.mapboxgl.Marker({ draggable: true, color })
            .setLngLat([lng, lat])
            .addTo(map);
    },

    onDragEnd(marker: MarkerInstance, cb: (lat: number, lng: number) => void) {
        marker.on('dragend', () => {
            const { lat, lng } = marker.getLngLat();
            cb(lat, lng);
        });
    },

    onMapClick(map: MapInstance, cb: (lat: number, lng: number) => void) {
        map.on('click', (e: { lngLat: { lat: number; lng: number } }) =>
            cb(e.lngLat.lat, e.lngLat.lng)
        );
    },

    async reverseGeocode(lat: number, lng: number) {
        const res = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${window.mapboxgl.accessToken}`
        );

        const data = await res.json();
        return data.features?.[0];
    },

    extractAddress(result: MapboxFeature) {
        if (!result) {
            return {};
        }

        const ctx = result.properties?.context || {};
        const address =
            result.properties?.full_address || result.place_name || '';

        return {
            address,
            city: ctx.place?.name,
            state: ctx.region?.name,
            country: ctx.country?.country_code,
            zip: ctx.postcode?.name,
            location_address: address,
        };
    },
};

/* ---------------- PROVIDER REGISTRY ---------------- */

const PROVIDERS: Record<MapProviderType, MapAdapter> = {
    google_map: googleAdapter,
    mapbox: mapboxAdapter,
};

/* ---------------- MAIN COMPONENT ---------------- */

export const MapProviderUI = ({
    apiKey,
    mapId,
    locationLat,
    locationLng,
    mapProvider,
    onLocationUpdate,
    placeholderSearch,
    stores,
}: MapProviderProps) => {
    const provider = PROVIDERS[mapProvider] || googleAdapter;

    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapInstance | null>(null);
    const markerRef = useRef<MarkerInstance | null>(null);
    const storeMarkersRef = useRef<MarkerInstance[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
    const [googleLoaded, setGoogleLoaded] = useState(false);

    const [initialCoords, setInitialCoords] = useState<{
        lat: number;
        lng: number;
    }>({
        lat: locationLat ? parseFloat(locationLat) : DEFAULT_LOCATION.lat,
        lng: locationLng ? parseFloat(locationLng) : DEFAULT_LOCATION.lng,
    });

    /* -------- UPDATE LOCATION -------- */

    const updateLocation = async (lat: number, lng: number) => {
        const result = await provider.reverseGeocode(lat, lng);

        const address = provider.extractAddress(result);

        onLocationUpdate({
            ...address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
        });
    };

    useEffect(() => {
        if (locationLat && locationLng) return; // already have saved location

        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setInitialCoords({ lat, lng });

                // OPTIONAL: also update parent form
                updateLocation(lat, lng);
            },
            () => {
                // Permission denied → fallback stays default
                setInitialCoords({
                    lat: DEFAULT_LOCATION.lat,
                    lng: DEFAULT_LOCATION.lng,
                });
            }
        );
    }, []);

    /* -------- MAP INIT -------- */

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const init = async () => {
            await provider.loadScript(apiKey);
            if (mapProvider === 'google_map') {
                setGoogleLoaded(true);
            }

            const map = provider.createMap(
                containerRef.current!,
                initialCoords.lat,
                initialCoords.lng,
                12,
                mapId
            );
            const marker = provider.createMarker(map, initialCoords.lat, initialCoords.lng, 'default');

            mapRef.current = map;
            markerRef.current = marker;

            provider.onDragEnd(marker, updateLocation);
            provider.onMapClick(map, updateLocation);
        };

        init();
    }, [initialCoords]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }

        // Clear previously rendered store markers.
        storeMarkersRef.current.forEach((marker) => {
            if ('map' in marker) {
                marker.map = null;
            } else if ('remove' in marker) {
                marker.remove();
            }
        });
        storeMarkersRef.current = [];

        // Render fresh store markers.
        stores?.data?.forEach((s) => {
            if (!s.location_lat || !s.location_lng) {
                return;
            }

            const marker = provider.createMarker(
                mapRef.current as MapInstance,
                parseFloat(s.location_lat),
                parseFloat(s.location_lng),
                'store',
                s.store_name
            );

            storeMarkersRef.current.push(marker);
        });
    }, [stores, provider]);

    useEffect(() => {
        if (!mapRef.current || !markerRef.current) {
            return;
        }

        const lat = parseFloat(locationLat);
        const lng = parseFloat(locationLng);

        if (!lat || !lng) {
            return;
        }

        if (mapProvider === 'google_map') {
            mapRef.current.setCenter({ lat, lng });
            markerRef.current.position = { lat, lng };
        } else if (mapProvider === 'mapbox') {
            mapRef.current.setCenter([lng, lat]);
            markerRef.current.setLngLat([lng, lat]);
        }
    }, [locationLat, locationLng]);

    useEffect(() => {
        if (mapProvider !== 'google_map') {
            return;
        }
        if (!googleLoaded) {
            return;
        }
        if (!inputRef.current) {
            return;
        }

        const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
                types: ['geocode'],
                fields: [
                    'formatted_address',
                    'geometry',
                    'address_components',
                    'name',
                ],
            }
        );

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            if (!place.geometry?.location) {
                return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            if (mapRef.current && markerRef.current) {
                mapRef.current.setCenter({ lat, lng });
                markerRef.current.position = { lat, lng };
                mapRef.current.setZoom(17);
            }

            const address = googleAdapter.extractAddress(place);

            onLocationUpdate({
                ...address,
                location_lat: lat.toString(),
                location_lng: lng.toString(),
            });
        });
    }, [mapProvider, googleLoaded]);

    /* -------- MAPBOX SEARCH -------- */

    const sessionToken = useRef(
        Math.random().toString(36).substring(2)
    ).current;

    const handleMapboxSearch = (text: string) => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const res = await fetch(
                `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
                    text
                )}&access_token=${apiKey}&session_token=${sessionToken}`
            );

            const data = await res.json();

            setSuggestions(data.suggestions || []);
        }, 300);
    };

    const selectMapboxSuggestion = async (suggestion: MapboxSuggestion) => {
        const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${apiKey}&session_token=${sessionToken}`
        );

        const data = await res.json();

        const feature = data.features?.[0];

        if (!feature) {
            return;
        }

        const [lng, lat] = feature.geometry.coordinates;

        if (mapRef.current && markerRef.current) {
            markerRef.current.setLngLat([lng, lat]);
            mapRef.current.setCenter([lng, lat]);
            mapRef.current.setZoom(17);
        }

        updateLocation(lat, lng);

        setSuggestions([]);
        setQuery(feature.properties?.full_address || suggestion.name);
    };

    return (
        <div className="map-wrapper">
            <div className="input-field">
                <input
                    ref={inputRef}
                    defaultValue={query}
                    placeholder={placeholderSearch}
                    className="basic-input"
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (mapProvider === 'mapbox') {
                            handleMapboxSearch(e.target.value);
                        }
                    }}
                />

                {suggestions.length > 0 && (
                    <ul>
                        {suggestions.map((s) => (
                            <li
                                key={s.mapbox_id}
                                onClick={() => selectMapboxSuggestion(s)}
                            >
                                {s.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div ref={containerRef} className="map" />
        </div>
    );
};

/* ---------------- FIELD REGISTRATION ---------------- */

const MapProvider: FieldComponent = {
    render: ({ field, value, onChange }) => (
        <MapProviderUI
            apiKey={field.apiKey}
            mapId={field.mapId}
            locationAddress={value?.location_address || ''}
            locationLat={value?.location_lat || ''}
            locationLng={value?.location_lng || ''}
            isUserLocation={field.isUserLocation}
            onLocationUpdate={onChange}
            placeholderSearch={field.placeholderSearch || 'Search location'}
            stores={field.stores || null}
            mapProvider={field.type}
        />
    ),
};

export default MapProvider;
