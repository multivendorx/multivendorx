import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { render } from '@wordpress/element';

/**
 * Dummy React component
 * (Later you will replace logic here)
 */
const StoreName = ({ context, blockProps }) => {
	const storeName =
		context === 'editor'
			? 'Demo Store (Editor)'
			: 'Live Store (Frontend)';

	return (
		<h2 {...blockProps} className="multivendorx-store-name">
			{storeName}
		</h2>
	);
};

registerBlockType('multivendorx/store-name', {
	apiVersion: 2,
	title: 'Store Name',
	icon: 'store',
	category: 'multivendorx',

	/**
	 * Enable style controls (same as WC Product Title)
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
			textTransform: true,
		},
		spacing: {
			margin: true,
			padding: true,
		},
	},

	edit() {
		const blockProps = useBlockProps();

		return <StoreName context="editor" blockProps={blockProps} />;
	},

	save() {
		/**
		 * Keep wrapper so Gutenberg saves styles
		 * React will hydrate inside
		 */
		const blockProps = useBlockProps.save();

		return (
			<div
				{...blockProps}
				data-mvx-store-name
			/>
		);
	},
});

/**
 * Frontend render
 */
document.addEventListener('DOMContentLoaded', () => {
	const element = document.querySelector('[data-mvx-store-name]');

	if (!element) {
		return;
	}

	render(
		<StoreName
			context="frontend"
			blockProps={{
				className: element.className,
				style: element.style,
			}}
		/>,
		element
	);
});
