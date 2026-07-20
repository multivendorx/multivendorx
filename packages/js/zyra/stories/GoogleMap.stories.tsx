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
