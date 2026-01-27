/* global google */
/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import FormGroup from './UI/FormGroup';

interface GoogleMapComponentProps {
    apiKey: string;
    locationAddress: string;
    locationLat: string;
    locationLng: string;
    isUserLocation?: boolean;
    onLocationUpdate: ( data: {
        location_address: string;
        location_lat: string;
        location_lng: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
    } ) => void;
    labelSearch: string;
    labelMap: string;
    placeholderSearch: string;
    stores: { data: Store[] } | null;
}

interface Store {
    id: number;
    store_name: string;
    address_1?: string;
    location_lat?: string;
    location_lng?: string;
}

interface ExtractedAddress {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
}

const GoogleMap = ( {
    apiKey,
    locationAddress,
    locationLat,
    locationLng,
    isUserLocation,
    onLocationUpdate,
    labelSearch,
    labelMap,
    placeholderSearch,
    stores,
}: GoogleMapComponentProps ) => {
    const [ map, setMap ] = useState< google.maps.Map | null >( null );
    const [ marker, setMarker ] = useState< google.maps.Marker | null >( null );
    const [ googleLoaded, setGoogleLoaded ] = useState< boolean >( false );

    const autocompleteInputRef = useRef< HTMLInputElement >( null );
    const mapContainerRef = useRef< HTMLDivElement >( null );

    useEffect( () => {
        if ( ! map || ! stores?.data?.length ) {
            return;
        }

        const markers: google.maps.Marker[] = [];

        stores.data.forEach( ( store ) => {
            if ( ! store.location_lat || ! store.location_lng ) {
                return;
            }

            const marker = new google.maps.Marker( {
                map,
                position: {
                    lat: parseFloat( store.location_lat ),
                    lng: parseFloat( store.location_lng ),
                },
                title: store.store_name,
            } );

            const infoWindow = new google.maps.InfoWindow( {
                content: `<strong>${ store.store_name }</strong><br/>${
                    store.address_1 || ''
                }`,
            } );

            marker.addListener( 'click', () => {
                infoWindow.open( map, marker );
            } );

            markers.push( marker );
        } );

        if ( markers.length ) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach( ( m ) => bounds.extend( m.getPosition()! ) );
            map.fitBounds( bounds );
        }

        return () => markers.forEach( ( m ) => m.setMap( null ) );
    }, [ map, stores ] );

    // Load Google Maps script
    useEffect( () => {
        if ( window.google && window.google.maps ) {
            setGoogleLoaded( true );
            return;
        }

        const script = document.createElement( 'script' );
        script.src = `https://maps.googleapis.com/maps/api/js?key=${ apiKey }&libraries=places`;
        script.async = true;

        script.onload = () => {
            setGoogleLoaded( true );
        };

        script.onerror = ( error ) => {
            console.error( 'Google Maps failed to load:', error );
        };

        document.head.appendChild( script );
    }, [ apiKey ] );

    // Initialize map when Google Maps is loaded
    useEffect( () => {
        if (
            ! googleLoaded ||
            ! autocompleteInputRef.current ||
            ! mapContainerRef.current
        ) {
            return;
        }

        if ( ! window.google || ! window.google.maps ) {
            return;
        }

        const initialLat = parseFloat( locationLat ) || 40.7128;
        const initialLng = parseFloat( locationLng ) || -74.006;

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

            const markerInstance = new window.google.maps.Marker( {
                map: mapInstance,
                draggable: true,
                position: { lat: initialLat, lng: initialLng },
                title: 'Store Location',
                icon: isUserLocation
                    ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    : undefined,
            } );

            markerInstance.addListener( 'dragend', () => {
                const position = markerInstance.getPosition();
                if ( position ) {
                    reverseGeocode( position.lat(), position.lng() );
                }
            } );

            mapInstance.addListener(
                'click',
                ( event: google.maps.MapMouseEvent ) => {
                    if ( event.latLng ) {
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
                    types: [ 'establishment', 'geocode' ],
                    fields: [
                        'address_components',
                        'formatted_address',
                        'geometry',
                        'name',
                    ],
                }
            );

            autocomplete.addListener( 'place_changed', () => {
                const place =
                    autocomplete.getPlace() as google.maps.places.PlaceResult;

                if ( place.geometry ) {
                    handlePlaceSelect( place );
                }
            } );

            setMap( mapInstance );
            setMarker( markerInstance );
        } catch ( err ) {
            console.error( err );
        }
    }, [ googleLoaded, locationLat, locationLng ] );

    const handlePlaceSelect = ( place: google.maps.places.PlaceResult ) => {
        if ( ! place.geometry ) {
            return;
        }

        const location = place.geometry.location;
        if ( ! location ) {
            return;
        }

        const lat = location.lat();
        const lng = location.lng();
        const formatted_address = place.formatted_address ?? '';

        const addressComponents = extractAddressComponents( place );

        if ( map && marker ) {
            map.setCenter( { lat, lng } );
            marker.setPosition( { lat, lng } );
            map.setZoom( 17 );
        }

        const newLocationData = {
            location_address: formatted_address,
            location_lat: lat.toString(),
            location_lng: lng.toString(),
            ...addressComponents,
        };

        if ( ! newLocationData.address && formatted_address ) {
            newLocationData.address = formatted_address;
        }

        onLocationUpdate( newLocationData );
    };

    const reverseGeocode = ( lat: number, lng: number ) => {
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode(
            { location: { lat, lng } },
            (
                results: google.maps.GeocoderResult[] | null,
                status: google.maps.GeocoderStatus
            ) => {
                if ( status === 'OK' && results && results[ 0 ] ) {
                    handlePlaceSelect(
                        results[ 0 ] as google.maps.places.PlaceResult
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

        if ( place.address_components ) {
            place.address_components.forEach(
                ( component: google.maps.GeocoderAddressComponent ) => {
                    const types = component.types;

                    if ( types.includes( 'street_number' ) ) {
                        streetNumber = component.long_name;
                    } else if ( types.includes( 'route' ) ) {
                        route = component.long_name;
                    } else if ( types.includes( 'locality' ) ) {
                        components.city = component.long_name;
                    } else if (
                        types.includes( 'administrative_area_level_1' )
                    ) {
                        components.state = component.short_name;
                    } else if ( types.includes( 'country' ) ) {
                        components.country = component.short_name;
                    } else if ( types.includes( 'postal_code' ) ) {
                        components.zip = component.long_name;
                    }
                }
            );

            if ( streetNumber && route ) {
                streetAddress = `${ streetNumber } ${ route }`;
            } else if ( route ) {
                streetAddress = route;
            } else if ( streetNumber ) {
                streetAddress = streetNumber;
            }

            components.address = streetAddress.trim();
        }

        return components;
    };

    return (
        <FormGroup label={ labelSearch }>
            <input
                ref={ autocompleteInputRef }
                id="store-location-autocomplete"
                type="text"
                className="basic-input"
                placeholder={ placeholderSearch }
                defaultValue={ locationAddress }
                style={ { width: '100%', height: '3rem', marginBottom: '8px' } }
            />
            <div
                ref={ mapContainerRef }
                id="location-map"
                style={ { height: '400px', width: '100%' } }
            />
        </FormGroup>
    );
};

export default GoogleMap;
