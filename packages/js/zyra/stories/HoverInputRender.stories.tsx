import HoverInputRender from '../src/components/HoverInputRender';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof HoverInputRender > = {
	title: 'Zyra/Components/Form/HoverInputRender',
	component: HoverInputRender,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof HoverInputRender >;

export const TestHoverInputRender: Story = {
	args: {
		label: 'Username',
		placeholder: 'Enter your username',
		onLabelChange: ( newLabel ) => {
			console.log( 'Label changed to:', newLabel );
		},
		renderStaticContent: ( {
			label,
			placeholder,
		}: {
			label: string;
			placeholder?: string;
		} ) => {
			return (
				<div className="edit-form-wrapper">
					<p>{ label }</p>
					<div className="settings-form-group-radio">
						<input
							className="basic-input"
							type="text"
							placeholder={ placeholder }
						/>
					</div>
				</div>
			);
		},
		renderEditableContent: ( {
			label,
			onLabelChange,
			placeholder,
		}: {
			label: string;
			onLabelChange: ( newLabel: string ) => void;
			placeholder?: string;
		} ) => (
			<>
				<input
					className="basic-input"
					type="text"
					value={ label }
					onChange={ ( event ) =>
						onLabelChange( event.target.value )
					}
				/>
				<input
					className="basic-input"
					type="text"
					readOnly
					placeholder={ placeholder }
				/>
			</>
		),
	},
	render: ( args ) => {
		return <HoverInputRender { ...args } />;
	},
};
