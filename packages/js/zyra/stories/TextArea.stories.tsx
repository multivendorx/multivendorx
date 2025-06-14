import TextArea from '../src/components/TextArea';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof TextArea > = {
	title: 'Zyra/Components/TextArea',
	component: TextArea,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof TextArea >;

export const TestTextArea: Story = {
	args: {
		id: 'comments-textarea',
		name: 'comments',
		value: 'Initial comment text',
		maxLength: 500,
		placeholder: 'Write your comments here...',
		inputClass: 'textarea-input',
		rowNumber: 5,
		colNumber: 50,
		proSetting: false,
		description: 'Please enter your detailed comments.',
		descClass: 'settings-metabox-description',
		onChange: ( e ) => console.log( 'Changed:', e.target.value ),
		onClick: ( e ) => console.log( 'Clicked', e.target ),
		onMouseOver: ( e ) => console.log( 'Mouse Over', e.target ),
		onMouseOut: ( e ) => console.log( 'Mouse Out', e.target ),
		onFocus: ( e ) => console.log( 'Focused', e.target ),
	},
	render: ( args ) => {
		return <TextArea { ...args } />;
	},
};
