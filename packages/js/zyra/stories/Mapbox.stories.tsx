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
