import { addFilter } from '@wordpress/hooks';
import { CardComponent, FormGroupComponent, FormGroupWrapperComponent } from '@zyra/components';
import { MultiCheckboxInput, SelectInputUI, TextInput } from '@zyra/inputs';
import { __ } from '@wordpress/i18n';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
		<CardComponent
			title={__('Stock & inventory', 'multivendorx')}
			desc={__(
				"Track your available quantity and let customers know what's in stock.",
				'multivendorx'
			)}
			action={
				<>
					<div className="field-wrapper">
						{__('Stock management', 'multivendorx')}
						<MultiCheckboxInput
							value={product.manage_stock ? ['manage_stock'] : []}
							look='toggle'
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
			<FormGroupWrapperComponent>
				<FormGroupComponent
					cols={6}
					label={__('SKU', 'multivendorx')}
					desc={__(
						'Used to identify this product in your inventory.',
						'multivendorx'
					)}
				>
					<TextInput
						name="sku"
						value={product.sku}
						onChange={(value) => handleChange('sku', value)}
					/>
				</FormGroupComponent>
				{!product.manage_stock && (
					<FormGroupComponent
						cols={6}
						label={__('Stock Status', 'multivendorx')}
					>
						<SelectInputUI
							name="stock_status"
							options={stockStatusOptions}
							value={product.stock_status}
							onChange={(selected) =>
								handleChange('stock_status', selected)
							}
						/>
					</FormGroupComponent>
				)}
				{product.manage_stock && (
					<>
						<FormGroupComponent
							cols={6}
							label={__('Quantity', 'multivendorx')}
						>
							<TextInput
								name="stock"
								value={product.stock_quantity}
								onChange={(value) =>
									handleChange('stock_quantity', value)
								}
							/>
						</FormGroupComponent>
						<FormGroupComponent
							cols={6}
							label={__('Allow backorders?', 'multivendorx')}
						>
							<SelectInputUI
								name="backorders"
								options={backorderOptions}
								value={product.backorders}
								onChange={(selected) =>
									handleChange('backorders', selected)
								}
							/>
						</FormGroupComponent>
						<FormGroupComponent
							cols={6}
							label={__('Low stock threshold', 'multivendorx')}
						>
							<TextInput
								name="low_stock_amount"
								value={product.low_stock_amount}
								onChange={(value) =>
									handleChange('low_stock_amount', value)
								}
							/>
						</FormGroupComponent>
					</>
				)}
			</FormGroupWrapperComponent>
		</CardComponent>
	);
};

addFilter(
	'multivendorx_add_product_middle_section',
	'multivendorx/inventory',
	(content, product, setProduct, handleChange, productFields) => {
		return (
			<>
				{content}
				{productFields.includes('inventory') && (
					<Inventory
						product={product}
						setProduct={setProduct}
						handleChange={handleChange}
					/>
				)}
			</>
		);
	},
	10
);
