// Mapbox.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Mapbox from '../src/components/Mapbox';

const meta: Meta<typeof Mapbox> = {
  title: 'Zyra/Components/Mapbox',
  component: Mapbox,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Mapbox>;

export const Default: Story = {
  render: (args) => {
    const [location, setLocation] = useState({
      location_address: '',
      location_lat: '40.7128',
      location_lng: '-74.0060',
    });

    return (
      <Mapbox
        {...args}
        locationLat={location.location_lat}
        locationLng={location.location_lng}
        onLocationUpdate={(data) => {
          console.log('Location updated:', data);
          setLocation(data);
        }}
      />
    );
  },
  args: {
    apiKey: 'pk.eyJ1IjoibW91bWl0YTIyIiwiYSI6ImNsNm40YnlxMjA3MzQzZW1vNGUzdHU4cWQifQ.ylkBBpH4xHOlOBtII6373g', // Replace with valid token
    locationAddress: '',
    labelSearch: 'Search for a location',
    labelMap: 'Select location on map',
    instructionText: 'Drag the marker or click on map to set location.',
    placeholderSearch: 'Type an address or location',
  },
};

export const PredefinedLocation: Story = {
  render: (args) => {
    const [location, setLocation] = useState({
      location_address: 'Empire State Building, NYC',
      location_lat: '40.748817',
      location_lng: '-73.985428',
    });

    return (
      <Mapbox
        {...args}
        locationLat={location.location_lat}
        locationLng={location.location_lng}
        onLocationUpdate={(data) => {
          console.log('Location updated:', data);
          setLocation(data);
        }}
      />
    );
  },
  args: {
    apiKey: 'pk.eyJ1IjoibW91bWl0YTIyIiwiYSI6ImNsNm40YnlxMjA3MzQzZW1vNGUzdHU4cWQifQ.ylkBBpH4xHOlOBtII6373g', // Replace with valid token
    locationAddress: 'Empire State Building, NYC',
    labelSearch: 'Search for a location',
    labelMap: 'Select location on map',
    instructionText: 'Drag the marker or click on map to set location.',
    placeholderSearch: 'Type an address or location',
  },
};

export const UserLocationMarker: Story = {
    render: Default.render,
    args: {
        ...Default.args,
        isUserLocation: true,
    },
};

export const MultipleStores: Story = {
    render: Default.render,
    args: {
        ...Default.args,
        stores: {
            data: [
                {
                    store_name: 'Store A',
                    location_lat: '40.7128',
                    location_lng: '-74.0060',
                    address_1: 'New York',
                },
                {
                    store_name: 'Store B',
                    location_lat: '34.0522',
                    location_lng: '-118.2437',
                    address_1: 'Los Angeles',
                },
            ],
        },
    },
};

export const SearchOnly: Story = {
    render: (args) => {
        const [location, setLocation] = useState({
            location_address: '',
            location_lat: '40.7128',
            location_lng: '-74.0060',
        });

        return (
            <>
                <p>Use search input only</p>
                <Mapbox
                    {...args}
                    locationLat={location.location_lat}
                    locationLng={location.location_lng}
                    onLocationUpdate={setLocation}
                />
            </>
        );
    },
    args: {
        apiKey: 'pk.eyJ1IjoibW91bWl0YTIyIiwiYSI6ImNsNm40YnlxMjA3MzQzZW1vNGUzdHU4cWQifQ.ylkBBpH4xHOlOBtII6373g', // Replace with valid token
        placeholderSearch: 'Type city, place, address',
        instructionText: 'Search to update marker',
        stores: { data: [] },
    },
};
