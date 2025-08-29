// Check in MVX
/**
 * External dependencies
 */
import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import '../styles/web/MapsInput.scss';

// Types
interface MapsInputProps {
    wrapperClass?: string;
    containerId?: string;
    containerClass?: string;
    Lat?: number;
    Lng?: number;
    proSetting: boolean;
    descClass?: string;
    description?: string;
}

declare const appLocalizer: { mapbox_api: string };

const MapsInput: React.FC< MapsInputProps > = ( props ) => {
    const [ Lat, setLat ] = useState< number >( props.Lat || 22.5726 ); // Default to Kolkata coordinates
    const [ Lng, setLng ] = useState< number >( props.Lng || 88.3639 );
    const mapContainerRef = useRef< HTMLDivElement | null >( null );
    const markerRef = useRef< mapboxgl.Marker | null >( null );

    useEffect( () => {
        if ( ! mapContainerRef.current ) return;

        // Initialize Mapbox
        mapboxgl.accessToken = appLocalizer.mapbox_api;
        const map = new mapboxgl.Map( {
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [ Lng, Lat ],
            zoom: 12,
        } );

        const geocoder = new MapboxGeocoder( {
            accessToken: mapboxgl.accessToken,
            marker: false,
            mapboxgl: mapboxgl as unknown as any, // Temporarily bypass type error
        } );

        // Add geocoder control to the map
        map.addControl( geocoder as any );

        // Create a marker and set it to the current location
        markerRef.current = new mapboxgl.Marker( { color: 'red' } )
            .setLngLat( [ Lng, Lat ] )
            .addTo( map );

        // Handle result from geocoder and update marker position
        geocoder.on( 'result', ( ev ) => {
            const { center } = ev.result;
            if ( center ) {
                setLat( center[ 1 ] );
                setLng( center[ 0 ] );
                markerRef.current?.setLngLat( center );
            }
        } );

        // Cleanup on component unmount
        return () => map.remove();
    }, [ Lat, Lng ] );

    useEffect( () => {
        // Update the marker position when coordinates change
        if ( markerRef.current ) {
            markerRef.current.setLngLat( [ Lng, Lat ] );
        }
    }, [ Lat, Lng ] );

    return (
        <div className={ props.wrapperClass }>
            <div
                ref={ mapContainerRef }
                id={ props.containerId || 'maps-container' }
                className={ props.containerClass || 'maps-container' }
                style={ { width: '100%', height: '300px' } }
            ></div>
            { props.proSetting && <span className="admin-pro-tag"><i className="adminlib-pro-tag"></i>Pro</span> }
            { props.description && (
                <p
                    className={ props.descClass }
                    dangerouslySetInnerHTML={ { __html: props.description } }
                ></p>
            ) }
        </div>
    );
};

export default MapsInput;
