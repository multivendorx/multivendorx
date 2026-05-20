/* global StoreInfo */
import { registerBlockType } from '@wordpress/blocks';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';

registerBlockType('multivendorx/store-name', {
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps({
			className: 'multivendorx-store-name-block',
			style: {
				fontSize: '2rem',
			},
		});

		return (
			<>
				<BlockControls>
					<AlignmentToolbar
						value={attributes.align}
						onChange={(nextAlign) => {
							setAttributes({ align: nextAlign });
						}}
					/>
				</BlockControls>

				<h2 {...blockProps}>Store Name</h2>
			</>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save();

		return <h2 {...blockProps} className="multivendorx-store-name"></h2>;
	},
});
