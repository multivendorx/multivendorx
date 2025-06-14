( globalThis as any ).appLocalizer = {
	khali_dabba: false,
	mapbox_api:
		'pk.eyJ1Ijoic2FuZ2l0YTIwMiIsImEiOiJjbTJ2amp3aGkwYmZhMmpxeDlmNDZqM2x0In0.8ZyMg2mfyq3ex81-n_MQ8w',
};

import MapsInput from '../src/components/MapsInput';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof MapsInput > = {
	title: 'Zyra/Components/MapsInput',
	component: MapsInput,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof MapsInput >;

export const TestMapsInput: Story = {
	args: {
		wrapperClass: 'settings-basic-input-class',
		descClass: 'settings-metabox-description',
		description: 'This is a simple map',
		containerId: 'store-maps',
		containerClass: 'store-maps gmap',
		proSetting: false,
		Lat: 37.7749, // Example latitude
		Lng: -122.4194, // Example longitude
	},
	render: ( args ) => {
		return <MapsInput { ...args } />;
	},
};
