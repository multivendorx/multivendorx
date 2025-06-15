import SimpleInput from '../src/components/SimpleInput';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof SimpleInput > = {
	title: 'Zyra/Components/Form/SimpleInput',
	component: SimpleInput,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof SimpleInput >;

export const TestSimpleInput: Story = {
	args: {
		formField: {
			label: 'Email',
			placeholder: 'Enter your email',
		},
		onChange: ( field, value ) => {
			console.log( `Field ${ field } changed to`, value );
		},
	},
	render: ( args ) => {
		return <SimpleInput { ...args } />;
	},
};
