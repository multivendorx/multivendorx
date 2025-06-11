( globalThis as any ).appLocalizer = {
	google_api: 'AIzaSyBNIfvjxTlKFU6ERNIYtFdI70hfwPpev-Q',
};

import GoogleMap from '../src/components/GoogleMap';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof GoogleMap > = {
	title: 'Zyra/Components/GoogleMap',
	component: GoogleMap,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof GoogleMap >;

export const TestGoogleMap: Story = {
	args: {
		center: { lat: 37.7749, lng: -122.4194 },
		wrapperClass: 'map-container',
		placeholder: 'Loading map...',
	},
	render: ( args ) => {
		return <GoogleMap { ...args } />;
	},
};
