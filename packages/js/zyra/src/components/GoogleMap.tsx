/* global google */
/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import FormGroupWrapper from './UI/FormGroupWrapper';
import FormGroup from './UI/FormGroup';

interface GoogleMapComponentProps {
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
    placeholderSearch: string;
}

interface ExtractedAddress {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
}

const GoogleMap = ({
    apiKey,
    locationAddress,
    locationLat,
    locationLng,
    onLocationUpdate,
    labelSearch,
    labelMap,
    placeholderSearch,
}: GoogleMapComponentProps) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);
    const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);

    const autocompleteInputRef = useRef<HTMLInputElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Load Google Maps script
    useEffect(() => {
        if (window.google && window.google.maps) {
            setGoogleLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;

        script.onload = () => {
            setGoogleLoaded(true);
        };

        script.onerror = (error) => {
            console.error('Google Maps failed to load:', error);
        };

        document.head.appendChild(script);
    }, [apiKey]);

    // Initialize map when Google Maps is loaded
    useEffect(() => {
        if (
            !googleLoaded ||
            !autocompleteInputRef.current ||
            !mapContainerRef.current
        ) {
            return;
        }

        if (!window.google || !window.google.maps) {
            return;
        }

        const initialLat = parseFloat(locationLat) || 40.7128;
        const initialLng = parseFloat(locationLng) || -74.006;

        try {
            const mapInstance = new window.google.maps.Map(
                mapContainerRef.current,
                {
                    center: { lat: initialLat, lng: initialLng },
                    zoom: locationLat ? 15 : 10,
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                }
            );

            const markerInstance = new window.google.maps.Marker({
                map: mapInstance,
                draggable: true,
                position: { lat: initialLat, lng: initialLng },
                title: 'Store Location',
            });

            markerInstance.addListener('dragend', () => {
                const position = markerInstance.getPosition();
                if (position) {
                    reverseGeocode(position.lat(), position.lng());
                }
            });

            mapInstance.addListener(
                'click',
                (event: google.maps.MapMouseEvent) => {
                    if (event.latLng) {
                        reverseGeocode(
                            event.latLng.lat(),
                            event.latLng.lng()
                        );
                    }
                }
            );

            const autocomplete = new window.google.maps.places.Autocomplete(
                autocompleteInputRef.current,
                {
                    types: ['establishment', 'geocode'],
                    fields: [
                        'address_components',
                        'formatted_address',
                        'geometry',
                        'name',
                    ],
                }
            );

            autocomplete.addListener('place_changed', () => {
                const place =
                    autocomplete.getPlace() as google.maps.places.PlaceResult;

                if (place.geometry) {
                    handlePlaceSelect(place);
                }
            });

            setMap(mapInstance);
            setMarker(markerInstance);
        } catch (err) {
            console.error(err);
        }
    }, [googleLoaded, locationLat, locationLng]);

    const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
        if (!place.geometry) {
            return;
        }

        const location = place.geometry.location;
        if (!location) {
            return;
        }

        const lat = location.lat();
        const lng = location.lng();
        const formatted_address = place.formatted_address ?? '';

        const addressComponents = extractAddressComponents(place);

        if (map && marker) {
            map.setCenter({ lat, lng });
            marker.setPosition({ lat, lng });
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
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode(
            { location: { lat, lng } },
            (
                results: google.maps.GeocoderResult[] | null,
                status: google.maps.GeocoderStatus
            ) => {
                if (status === 'OK' && results && results[0]) {
                    handlePlaceSelect(
                        results[0] as google.maps.places.PlaceResult
                    );
                }
            }
        );
    };

    const extractAddressComponents = (
        place: google.maps.places.PlaceResult
    ): ExtractedAddress => {
        const components: ExtractedAddress = {};
        let streetNumber = '';
        let route = '';
        let streetAddress = '';

        if (place.address_components) {
            place.address_components.forEach(
                (component: google.maps.GeocoderAddressComponent) => {
                    const types = component.types;

                    if (types.includes('street_number')) {
                        streetNumber = component.long_name;
                    } else if (types.includes('route')) {
                        route = component.long_name;
                    } else if (types.includes('locality')) {
                        components.city = component.long_name;
                    } else if (
                        types.includes('administrative_area_level_1')
                    ) {
                        components.state = component.short_name;
                    } else if (types.includes('country')) {
                        components.country = component.short_name;
                    } else if (types.includes('postal_code')) {
                        components.zip = component.long_name;
                    }
                }
            );

            if (streetNumber && route) {
                streetAddress = `${streetNumber} ${route}`;
            } else if (route) {
                streetAddress = route;
            } else if (streetNumber) {
                streetAddress = streetNumber;
            }

            components.address = streetAddress.trim();
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
                    <input
                        ref={autocompleteInputRef}
                        id="store-location-autocomplete"
                        type="text"
                        className="basic-input"
                        placeholder={placeholderSearch}
                        defaultValue={locationAddress}
                    />
                </div>
            </FormGroup>
        </>
    );
};

export default GoogleMap;
