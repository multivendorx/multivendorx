// GoogleMap.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import GoogleMap from '../src/components/GoogleMap';

const meta: Meta<typeof GoogleMap> = {
    title: 'Zyra/Components/GoogleMap',
    component: GoogleMap,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GoogleMap>;

// Default story: empty map with search
export const Default: Story = {
    render: (args) => {
        const [locationData, setLocationData] = useState({
            location_address: '',
            location_lat: '',
            location_lng: '',
        });

        return (
            <div>
                <GoogleMap
                    {...args}
                    locationAddress={locationData.location_address}
                    locationLat={locationData.location_lat}
                    locationLng={locationData.location_lng}
                    onLocationUpdate={setLocationData}
                />
                <div style={{ marginTop: '20px' }}>
                    <strong>Selected Location:</strong>
                    <pre>{JSON.stringify(locationData, null, 2)}</pre>
                </div>
            </div>
        );
    },
    args: {
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
        labelSearch: 'Search for a location',
        labelMap: 'Map',
        placeholderSearch: 'Enter address...',
    },
};

// Pre-filled location story
export const PreFilledLocation: Story = {
    render: (args) => {
        const [locationData, setLocationData] = useState({
            location_address: '1600 Amphitheatre Parkway, Mountain View, CA',
            location_lat: '37.4221',
            location_lng: '-122.0841',
        });

        return (
            <div>
                <GoogleMap
                    {...args}
                    locationAddress={locationData.location_address}
                    locationLat={locationData.location_lat}
                    locationLng={locationData.location_lng}
                    onLocationUpdate={setLocationData}
                />
                <div style={{ marginTop: '20px' }}>
                    <strong>Selected Location:</strong>
                    <pre>{JSON.stringify(locationData, null, 2)}</pre>
                </div>
            </div>
        );
    },
    args: {
        apiKey: 'AIzaSyAEUy5ZtNn9Q8EmTp09h_MP7te3_IRkKwc',
        labelSearch: 'Search for a location',
        labelMap: 'Map',
        placeholderSearch: 'Enter address...',
    },
};

// Dynamic location change story
export const DynamicLocation: Story = {
    render: (args) => {
        const [locationData, setLocationData] = useState({
            location_address: '',
            location_lat: '',
            location_lng: '',
        });

        const setNewYork = () => {
            setLocationData({
                location_address: 'New York, NY, USA',
                location_lat: '40.7128',
                location_lng: '-74.006',
            });
        };

        return (
            <div>
                <GoogleMap
                    {...args}
                    locationAddress={locationData.location_address}
                    locationLat={locationData.location_lat}
                    locationLng={locationData.location_lng}
                    onLocationUpdate={setLocationData}
                />
                <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                    <button onClick={setNewYork} className="admin-btn btn-purple">
                        Move to New York
                    </button>
                </div>
                <div>
                    <strong>Selected Location:</strong>
                    <pre>{JSON.stringify(locationData, null, 2)}</pre>
                </div>
            </div>
        );
    },
    args: {
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
        labelSearch: 'Search for a location',
        labelMap: 'Map',
        placeholderSearch: 'Enter address...',
    },
};

export const UserLocationMarker: Story = {
    render: (args) => {
        const [locationData, setLocationData] = useState({
            location_address: 'New York, NY, USA',
            location_lat: '40.7128',
            location_lng: '-74.0060',
        });

        return (
            <GoogleMap
                {...args}
                isUserLocation
                locationAddress={locationData.location_address}
                locationLat={locationData.location_lat}
                locationLng={locationData.location_lng}
                onLocationUpdate={setLocationData}
            />
        );
    },
    args: {
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
        labelSearch: 'User Location',
        labelMap: 'Map',
        placeholderSearch: 'Search address...',
        stores: { data: [] },
    },
};

export const WithStores: Story = {
    render: (args) => {
        const [locationData, setLocationData] = useState({
            location_address: '',
            location_lat: '',
            location_lng: '',
        });

        return (
            <GoogleMap
                {...args}
                locationAddress={locationData.location_address}
                locationLat={locationData.location_lat}
                locationLng={locationData.location_lng}
                onLocationUpdate={setLocationData}
            />
        );
    },
    args: {
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
        labelSearch: 'Store Locations',
        labelMap: 'Map',
        placeholderSearch: 'Search...',
        stores: {
            data: [
                {
                    store_name: 'Store One',
                    location_lat: '40.7128',
                    location_lng: '-74.0060',
                    address_1: 'New York',
                },
                {
                    store_name: 'Store Two',
                    location_lat: '34.0522',
                    location_lng: '-118.2437',
                    address_1: 'Los Angeles',
                },
            ],
        },
    },
};