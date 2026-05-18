import React, { useEffect, useState } from 'react';
import { MapProviderUI, useModules } from 'zyra';
import { __ } from '@wordpress/i18n';
import { dispatch as wpDispatch } from '@wordpress/data';

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
    // 1. Core Component States
    const [mapConfig, setMapConfig] = useState<MapConfigState>({ provider: null, apiKey: '' });
    const [addressData, setAddressData] = useState<AddressDataState>({
        location_lat: '',
        location_lng: '',
        address: '',
    });

    // 2. Dependencies and Global Targets
    const { modules } = useModules();
    const ExperimentalCheckoutFields = (window as any)?.wc?.blocksCheckout?.ExperimentalOrderShippingPackages;
    const settings = (window as any).appLocalizer?.settings_databases_value;

    /**
     * Push localized state maps down to the WooCommerce Blocks Extension registry.
     */
    const saveToCheckout = (locationData: any) => {
        const wcBlocks = (window as any)?.wc?.wcBlocksData;
        if (!wcBlocks) return;

        const storeKey = wcBlocks.CHECKOUT_STORE_KEY;
        const checkoutDispatch = wpDispatch(storeKey);

        // Safely invoke runtime schema mutations outside hook lifecycle limits
        if (checkoutDispatch && typeof (checkoutDispatch as any).setExtensionData === 'function') {
            (checkoutDispatch as any).setExtensionData('multivendorx', {
                user_location: locationData.address,
                user_location_lat: locationData.location_lat,
                user_location_lng: locationData.location_lng,
            });
        }
    };

    /**
     * Map trigger change listener callback
     */
    const handleLocationUpdate = (locationData: any) => {
        const updatePayload = {
            address: locationData.address || '',
            location_lat: locationData.location_lat || '',
            location_lng: locationData.location_lng || '',
        };
        
        setAddressData(updatePayload);
        saveToCheckout(updatePayload);
    };

    // 3. Initialize Settings Config Mapper
    useEffect(() => {
        if (!settings?.geolocation) return;

        const provider = settings.geolocation.choose_map_api;
        const apiKey = settings.geolocation[`${provider}_api_key`] || '';

        setMapConfig({
            provider: provider || null,
            apiKey: apiKey,
        });
    }, [settings]);

    /**
     * Render Method Strategy Pattern Builder
     */
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

    // Render configuration pipeline fallback for environments lacking active block wrappers
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