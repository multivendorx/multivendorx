import FormCustomizer from '../src/components/NotifimaFormCustomizer';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof FormCustomizer > = {
	title: 'Zyra/Components/Notifima/FormCustomizer',
	component: FormCustomizer,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof FormCustomizer >;

export const TestFormCustomizer: Story = {
	args: {
		value: 'default value',
		buttonText: 'Submit',
		setting: {
			field1: 'value1',
			field2: true,
		},
		proSetting: {
			enabled: true,
			tier: 'pro',
		},
		onChange: ( key, value, isRestoreDefaults ) => {
			console.log(
				`Changed ${ key } to`,
				value,
				'Restore defaults:',
				isRestoreDefaults
			);
		},
	},
	render: ( args ) => {
		return <FormCustomizer { ...args } />;
	},
};
