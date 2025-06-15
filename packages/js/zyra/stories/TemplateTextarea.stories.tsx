import TemplateTextArea from '../src/components/TemplateTextArea';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof TemplateTextArea > = {
	title: 'Zyra/Components/Form/TemplateTextArea',
	component: TemplateTextArea,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof TemplateTextArea >;

export const TestTemplateTextArea: Story = {
	args: {
		formField: {
			label: 'Description',
			placeholder: 'Enter your description here...',
		},
		onChange: ( field, value ) => {
			console.log( `Field: ${ field }, Value: ${ value }` );
		},
	},
	render: ( args ) => {
		return <TemplateTextArea { ...args } />;
	},
};
