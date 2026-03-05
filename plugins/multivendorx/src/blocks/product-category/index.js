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
			{ id: 1, name: __('Electronics', 'multivendorx'), count: 12 },
			{ id: 2, name: __('Clothing', 'multivendorx'), count: 8 },
			{ id: 3, name: __('Home & Kitchen', 'multivendorx'), count: 15 },
			{ id: 4, name: __('Books', 'multivendorx'), count: 23 },
			{ id: 5, name: __('Sports', 'multivendorx'), count: 7 },
		];

		return (
			<>
				<BlockControls>
					<AlignmentToolbar
						value={attributes.align}
						onChange={(nextAlign) =>
							setAttributes({ align: nextAlign })
						}
					/>
				</BlockControls>

				<div {...blockProps}>
					<h3>{__('Product Categories', 'multivendorx')}</h3>
					<div className="wp-block-multivendorx-product-category multivendorx-product-categories">
					<ul className="wc-block-product-categories-list">
						{categories.map((category) => (
							<li
								key={category.id}
								className="wc-block-product-categories-list-item"
							>
								<a>
									<span className="wc-block-product-categories-list-item__name">{category.name}</span>
								</a>
								<span className="wc-block-product-categories-list-item-count">{category.count}</span>
							</li>
						))}
					</ul>
					</div>
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
			<div
				{...blockProps}
				id="multivendorx-store-product-category"
			></div>
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
