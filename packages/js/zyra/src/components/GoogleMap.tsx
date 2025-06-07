/// <reference types="google.maps" />

import React, { useEffect, useState, useRef } from "react";
import GoogleMapReact from "google-map-react";

interface AnyReactComponentProps {
    text: string;
}
const AnyReactComponent: React.FC< AnyReactComponentProps > = ( { text } ) => (
    <img src={ text } width="38" height="50" alt="marker" />
);

interface AutoCompleteProps {
    map: google.maps.Map;
    mapApi: typeof google.maps | null;
    addPlace: ( place: google.maps.places.PlaceResult ) => void;
    placeholder?: string;
}

declare const appLocalizer: { google_api: string };

const AutoComplete: React.FC< AutoCompleteProps > = ( {
    map,
    mapApi,
    addPlace,
    placeholder,
} ) => {
    const [ autoComplete, setAutoComplete ] =
        useState< google.maps.places.Autocomplete | null >( null );
    const inputRef = useRef< HTMLInputElement | null >( null );

    useEffect( () => {
        if ( mapApi?.places && inputRef.current ) {
            const options = { types: [ "address" ] };
            const autoCompleteInstance = new mapApi.places.Autocomplete(
                inputRef.current,
                options
            );
            autoCompleteInstance.addListener(
                "place_changed",
                handleOnPlaceChanged
            );
            autoCompleteInstance.bindTo( "bounds", map );
            setAutoComplete( autoCompleteInstance );
        }
    }, [ mapApi, map ] );

    const handleOnPlaceChanged = () => {
        if ( ! autoComplete ) return;
        const place = autoComplete.getPlace();
        if ( ! place.geometry ) return;
        if ( place.geometry.viewport ) {
            map.fitBounds( place.geometry.viewport );
        } else {
            map.setCenter( place.geometry.location! );
            map.setZoom( 17 );
        }
        addPlace( place );
        inputRef.current!.blur();
    };

    const clearSearchBox = () => {
        if ( inputRef.current ) inputRef.current.value = "";
    };

    return (
        <input
            className="search-input"
            ref={ inputRef }
            type="text"
            onFocus={ clearSearchBox }
            placeholder={ placeholder }
        />
    );
};

interface GoogleMapProps {
    center: { lat: number; lng: number };
    wrapperClass?: string;
    placeholder?: string;
}

const GoogleMap: React.FC< GoogleMapProps > = ( props ) => {
    const [ zoom, setZoom ] = useState< number >( 12 );
    const [ center, setCenter ] = useState< { lat: number; lng: number } >(
        props.center
    );
    const [ draggable, setDraggable ] = useState< boolean >( true );
    const [ address, setAddress ] = useState< string | undefined >();
    const [ position, setPosition ] = useState< {
        lat: number | string;
        lng: number | string;
    } >( {
        lat: "",
        lng: "",
    } );

    const [ mapApi, setMapApi ] = useState< typeof google.maps | null >( null );
    const [ mapApiLoaded, setMapApiLoaded ] = useState< boolean >( false );
    const [ mapInstance, setMapInstance ] = useState< google.maps.Map | null >(
        null
    );

    useEffect( () => {
        if ( "geolocation" in navigator ) {
            navigator.geolocation.getCurrentPosition( ( pos ) => {
                setCenter( {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                } );
                setPosition( {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                } );
            } );
        }
    }, [] );

    const handleOnChange = ( {
        center,
        zoom,
    }: {
        center: { lat: number; lng: number };
        zoom: number;
    } ) => {
        setZoom( zoom );
        setCenter( center );
    };

    const handleOnClick = ( value: { lat: number; lng: number } ) => {
        setPosition( { lat: value.lat, lng: value.lng } );
    };

    const onMarkerInteraction = (
        _: any,
        __: any,
        mouse: { lat: number; lng: number }
    ) => {
        setDraggable( false );
        setPosition( { lat: mouse.lat, lng: mouse.lng } );
    };

    const onMarkerInteractionMouseUp = () => {
        setDraggable( true );
        generateAddress();
    };

    const apiHasLoaded = ( map: google.maps.Map, maps: typeof google.maps ) => {
        setMapApiLoaded( true );
        setMapInstance( map );
        setMapApi( maps );
        generateAddress();
    };

    const addPlace = ( place: google.maps.places.PlaceResult ) => {
        if ( ! place.geometry ) return;
        setPosition( {
            lat: place.geometry.location!.lat(),
            lng: place.geometry.location!.lng(),
        } );
        generateAddress();
    };

    const generateAddress = () => {
        if ( ! mapApi || ! position.lat || ! position.lng ) return;
        const geocoder = new mapApi.Geocoder();

        geocoder.geocode(
            { location: { lat: +position.lat, lng: +position.lng } },
            ( results, status ) => {
                if ( status === "OK" && results?.[ 0 ] ) {
                    setZoom( 12 );
                    setAddress( results[ 0 ].formatted_address );
                } else {
                    window.alert( "Geocoder failed due to: " + status );
                }
            }
        );
    };

    return (
        <div className={ props.wrapperClass }>
            { mapApiLoaded && mapInstance && (
                <AutoComplete
                    map={ mapInstance }
                    mapApi={ mapApi }
                    addPlace={ addPlace }
                    placeholder={ props.placeholder }
                />
            ) }
            <div style={ { height: "50vh", width: "50%" } }>
                <GoogleMapReact
                    zoom={ zoom }
                    center={ center }
                    draggable={ draggable }
                    onClick={ handleOnClick }
                    onChange={ handleOnChange }
                    onChildMouseMove={ onMarkerInteraction }
                    onChildMouseDown={ onMarkerInteraction }
                    onChildMouseUp={ onMarkerInteractionMouseUp }
                    bootstrapURLKeys={ {
                        key: appLocalizer.google_api, // Ensure `appLocalizer` is properly typed
                        libraries: [ "places", "geometry" ],
                    } }
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={ ( { map, maps } ) =>
                        apiHasLoaded( map, maps )
                    }
                >
                    <AnyReactComponent text="{appLocalizer.marker_icon}" />
                </GoogleMapReact>
            </div>
        </div>
    );
};

export default GoogleMap;
