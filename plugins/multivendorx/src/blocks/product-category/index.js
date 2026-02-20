import { registerBlockType } from '@wordpress/blocks';
import {
	BlockControls,
	AlignmentToolbar,
	useBlockProps,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import ProductCategory from './ProductCategory';

registerBlockType('multivendorx/product-category', {
	attributes: {
		align: {
			type: 'string',
			default: 'none',
		},
	},

	edit: ({ attributes, setAttributes }) => {
		const { align } = attributes;

		const blockProps = useBlockProps({
			className: 'multivendorx-product-categories',
			style: {
				textAlign: align === 'none' ? undefined : align,
			},
		});

		const categories = [
			{ id: 1, name: 'Electronics', count: 12 },
			{ id: 2, name: 'Clothing', count: 8 },
			{ id: 3, name: 'Home & Kitchen', count: 15 },
			{ id: 4, name: 'Books', count: 23 },
			{ id: 5, name: 'Sports', count: 7 },
		];

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

				<div {...blockProps}>
					<h3>Product Categories</h3>
					<ul className="multivendorx-category-list">
						{categories.map((category) => (
							<li
								key={category.id}
								className="multivendorx-category-item"
							>
								<span className="multivendorx-category-name">
									{category.name}
								</span>
								<span className="multivendorx-category-count">
									({category.count})
								</span>
							</li>
						))}
					</ul>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { align } = attributes;

		const blockProps = useBlockProps.save({
			className: 'multivendorx-product-categories',
			style: {
				textAlign: align === 'none' ? undefined : align,
			},
		});

		return (
			<div {...blockProps} id="multivendorx-store-product-category"></div>
		);
	},
});
document.addEventListener('DOMContentLoaded', () => {
	const el = document.getElementById('multivendorx-store-product-category');

	if (!el) {
		return;
	}

	render(
		<BrowserRouter>
			<ProductCategory />
		</BrowserRouter>,
		el
	);
});
