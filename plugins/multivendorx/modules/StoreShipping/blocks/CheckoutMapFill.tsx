import React, { useEffect, useState } from 'react';
import { MapProviderUI, useModules } from 'zyra';
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

    const { modules } = useModules();
    const ExperimentalCheckoutFields = (window as any)?.wc?.blocksCheckout?.ExperimentalOrderShippingPackages;
    const settings = (window as any).appLocalizer?.settings_databases_value;

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
        if (!settings?.geolocation) return;

        const provider = settings.geolocation.choose_map_api;
        const apiKey = settings.geolocation[`${provider}_api_key`] || '';

        setMapConfig({
            provider: provider || null,
            apiKey: apiKey,
        });
    }, [settings]);

    const renderMapComponent = () => {
        if (!modules.includes('geo-location') || !mapConfig.apiKey || !mapConfig.provider) {
            return null;
        }

        return (
            <MapProviderUI
                apiKey={mapConfig.apiKey}
                mapId={settings?.geolocation?.google_map_id || ''}
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

    if (!ExperimentalCheckoutFields) {
        return renderMapComponent();
    }

    return (
        <ExperimentalCheckoutFields>
            <div style={{ marginBottom: '1.25rem', width: '100%' }}>
                {renderMapComponent()}
            </div>
        </ExperimentalCheckoutFields>
    );
};

export default CheckoutMapFill;