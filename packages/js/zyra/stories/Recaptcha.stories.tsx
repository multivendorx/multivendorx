import Recaptcha from '../src/components/Recaptcha';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof Recaptcha > = {
	title: 'Zyra/Components/Form/Recaptcha',
	component: Recaptcha,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof Recaptcha >;

export const TestRecaptcha: Story = {
	args: {
		formField: {
			sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Google test sitekey
		},
		onChange: ( field, value ) => {
			console.log( `Recaptcha response for field "${ field }":`, value );
		},
	},
	render: ( args ) => {
		return <Recaptcha { ...args } />;
	},
};
