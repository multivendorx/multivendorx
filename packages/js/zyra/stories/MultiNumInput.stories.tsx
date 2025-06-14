import MultiNumInput from '../src/components/MultiNumInput';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof MultiNumInput > = {
	title: 'Zyra/Components/MultiNumInput',
	component: MultiNumInput,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof MultiNumInput >;

export const TestMultiNumInput: Story = {
	args: {
		parentWrapperClass: 'settings-basic-input-class',
		childWrapperClass: 'settings-basic-child-wrap',
		inputWrapperClass: 'settings-basic-input-child-class',
		innerInputWrapperClass: 'setting-form-input',
		inputLabelClass: 'setting-form-basic-input',
		inputClass: 'basic-input',
		idPrefix: 'setting-integer-input',
		keyName: 'maxUsers',
		value: [
			{ key: 'basic', value: 100 },
			{ key: 'pro', value: 500 },
		],
		options: [
			{
				key: 'basic',
				value: 100,
				label: 'Basic Plan',
				type: 'number',
				inputClass: 'basic-input',
			},
			{
				key: 'pro',
				value: 500,
				label: 'Pro Plan',
				type: 'number',
			},
		],
		description: 'Set the maximum number of users allowed for each plan.',
		descClass: 'input-description',
		proSetting: true,
		onChange: ( e, keyName, optionKey, index ) => {
			console.log( 'Changed:', {
				keyName,
				optionKey,
				index,
				value: e.target.value,
			} );
		},
	},
	render: ( args ) => {
		return <MultiNumInput { ...args } />;
	},
};
