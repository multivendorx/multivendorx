import { addFilter } from '@wordpress/hooks';
import {
	MultiCheckBoxUI,
	SelectInputUI,
	Card,
	BasicInputUI,
	FormGroup,
	FormGroupWrapper,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const Inventory = ({ product, setProduct, handleChange }) => {
	const stockStatusOptions = [
		{ value: '', label: 'Stock Status' },
		{ value: 'instock', label: 'In Stock' },
		{ value: 'outofstock', label: 'Out of Stock' },
		{ value: 'onbackorder', label: 'On Backorder' },
	];

	const backorderOptions = [
		{ label: 'Do not allow', value: 'no' },
		{ label: 'Allow, but notify customer', value: 'notify' },
		{ label: 'Allow', value: 'yes' },
	];

	return (
		<Card
			contentHeight
			title={__('Inventory', 'multivendorx')}
			action={
				<>
					<div className="field-wrapper">
						{__('Stock management', 'multivendorx')}
						<MultiCheckBoxUI
							value={product.manage_stock ? ['manage_stock'] : []}
							options={[
								{
									key: 'manage_stock',
									value: 'manage_stock',
								},
							]}
							onChange={(val: string[]) => {
								const isChecked = val.includes('manage_stock');

								handleChange('manage_stock', isChecked);
							}}
						/>
					</div>
				</>
			}
		>
			<FormGroupWrapper>
				<FormGroup
					cols={2}
					label={__('SKU', 'multivendorx')}
				>
					<BasicInputUI
						name="sku"
						value={product.sku}
						onChange={(value) =>
							handleChange('sku', value)
						}
					/>
				</FormGroup>
				{!product.manage_stock && (
					<FormGroup
						cols={2}
						label={__('Stock Status', 'multivendorx')}
					>
						<SelectInputUI
							name="stock_status"
							options={stockStatusOptions}
							value={product.stock_status}
							onChange={(selected) =>
								handleChange(
									'stock_status',
									selected.value
								)
							}
						/>
					</FormGroup>
				)}
				{product.manage_stock && (
					<>
						<FormGroup
							cols={2}
							label={__('Quantity', 'multivendorx')}
						>
							<BasicInputUI
								name="stock"
								value={product.stock}
								onChange={(value) =>
									handleChange('stock', value)
								}
							/>
						</FormGroup>
						<FormGroup
							cols={2}
							label={__(
								'Allow backorders?',
								'multivendorx'
							)}
						>
							<SelectInputUI
								name="backorders"
								options={backorderOptions}
								value={product.backorders}
								onChange={(selected) =>
									handleChange(
										'backorders',
										selected.value
									)
								}
							/>
						</FormGroup>
						<FormGroup
							cols={2}
							label={__(
								'Low stock threshold',
								'multivendorx'
							)}
						>
							<BasicInputUI
								name="low_stock_amount"
								value={product.low_stock_amount}
								onChange={(value) =>
									handleChange(
										'low_stock_amount',
										value
									)
								}
							/>
						</FormGroup>
					</>
				)}
			</FormGroupWrapper>
		</Card>
	);
};

addFilter(
	'product_inventory',
	'my-plugin/inventory',
	(content, product, setProduct, handleChange) => {
		return (
			<>
				{content}
				<Inventory product={product} setProduct={setProduct} handleChange={handleChange} />
			</>
		);
	},
	10
);
