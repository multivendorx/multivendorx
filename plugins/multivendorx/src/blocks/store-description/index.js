import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Editor-only component
 */
const StoreDescriptionEditor = ({ blockProps }) => {
	return (
		<div {...blockProps} className="multivendorx-store-description">
			<p>This is a demo store description shown in the editor.</p>
		</div>
	);
};

registerBlockType('multivendorx/store-description', {
	edit() {
		const blockProps = useBlockProps();

		return <StoreDescriptionEditor blockProps={blockProps} />;
	},

	save() {
		const blockProps = useBlockProps.save();

		return (
			<div
				{...blockProps}
				className="multivendorx-store-description"
				data-wp-interactive="multivendorx/store"
			>
				<h2>
					<span data-wp-text="state.storeName" />
				</h2>
				<p className="store-description">
					<span data-wp-text="state.storeDescription" />
				</p>
			</div>
		);
	}

});
