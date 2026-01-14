import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';

/**
 * Dummy React component
 * (Later you will replace this with real store data)
 */
const StoreDescription = ({ context, blockProps }) => {
	const description =
		context === 'editor'
			? 'This is a demo store description shown in the editor.'
			: 'This is the live store description shown on the frontend.';

	return (
		<div {...blockProps} className="multivendorx-store-description">
			<p>{description}</p>
		</div>
	);
};

registerBlockType('multivendorx/store-description', {
	apiVersion: 2,
	title: 'Store Description',
	icon: 'text-page',
	category: 'multivendorx',

	/**
	 * Style support (same philosophy as WC blocks)
	 */
	supports: {
		html: false,
		color: {
			text: true,
			background: false,
		},
		typography: {
			fontSize: true,
			lineHeight: true,
			fontFamily: true,
			fontWeight: true,
		},
		spacing: {
			margin: true,
			padding: true,
		},
	},

	edit() {
		const blockProps = useBlockProps();

		return <StoreDescription context="editor" blockProps={blockProps} />;
	},

	save() {
		// Save styles only, React hydrates content
		const blockProps = useBlockProps.save();

		return (
			<div
				{...blockProps}
				data-mvx-store-description
			/>
		);
	},
});

/**
 * Frontend render
 */
document.addEventListener('DOMContentLoaded', () => {
	const element = document.querySelector('[data-mvx-store-description]');

	if (!element) {
		return;
	}

	render(
		<StoreDescription
			context="frontend"
			blockProps={{
				className: element.className,
				style: element.style,
			}}
		/>,
		element
	);
});
