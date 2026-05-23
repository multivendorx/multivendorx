import React, { useEffect, useState } from 'react';
import { MapProviderUI } from 'zyra';
import { __ } from '@wordpress/i18n';

interface MapConfigState {
    provider: string | null;
    apiKey: string;
}

interface AddressDataState {
    location_lat: string;
    location_lng: string;
    address: string;
}

const CheckoutMapFill: React.FC = () => {
    const [mapConfig, setMapConfig] = useState<MapConfigState>({ provider: null, apiKey: '' });
    const [addressData, setAddressData] = useState<AddressDataState>({
        location_lat: '',
        location_lng: '',
        address: '',
    });

    const ExperimentalCheckoutFields = (window as any)?.wc?.blocksCheckout?.ExperimentalOrderShippingPackages;
    const settings = (window as any)?.blockCheckout?.settings || {};

    /**
     * Sends data on-demand to the Store API using the official extensionCartUpdate function.
     */
    const saveToCheckout = (locationData: any) => {
        const blocksCheckout = (window as any)?.wc?.blocksCheckout;
        if (!blocksCheckout || typeof blocksCheckout.extensionCartUpdate !== 'function') {
            return;
        }

        // Trigger on-demand cart synchronization instantly as documented
        blocksCheckout.extensionCartUpdate({
            namespace: 'multivendorx',
            data: {
                user_location: locationData.address,
                user_location_lat: locationData.location_lat,
                user_location_lng: locationData.location_lng,
            },
        }).catch((error: any) => {
            const wcBlocksData = (window as any)?.wc?.wcBlocksData;
            if (wcBlocksData && typeof wcBlocksData.processErrorResponse === 'function') {
                wcBlocksData.processErrorResponse(error);
            }
        });
    };

    const handleLocationUpdate = (locationData: any) => {
        const updatePayload = {
            address: locationData.address || '',
            location_lat: locationData.location_lat || '',
            location_lng: locationData.location_lng || '',
        };

        setAddressData(updatePayload);
        saveToCheckout(updatePayload);
    };

    useEffect(() => {
        if (!settings) {
            return;
        }
        const provider = settings.choose_map_api;
        const apiKey = settings[`${provider}_api_key`] || '';

        setMapConfig({
            provider: provider || null,
            apiKey,
        });
    }, [settings]);
    const renderMapComponent = () => {
        if (!mapConfig.apiKey || !mapConfig.provider) {
            return null;
        }

        return (
            <MapProviderUI
                apiKey={mapConfig.apiKey}
                mapId={settings?.google_map_id || ''}
                locationAddress={addressData.address}
                locationLat={addressData.location_lat}
                locationLng={addressData.location_lng}
                isUserLocation={false}
                onLocationUpdate={handleLocationUpdate}
                placeholderSearch={__('Search for a location...', 'multivendorx')}
                stores={null}
                mapProvider={mapConfig.provider}
            />
        );
    };

    return (
        <ExperimentalCheckoutFields>
            <div >
                {renderMapComponent()}
            </div>
        </ExperimentalCheckoutFields>
    );
};

export default CheckoutMapFill;