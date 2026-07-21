import { addFilter } from '@wordpress/hooks';
import { useEffect, useState } from 'react';
import { CardComponent, FormGroupComponent, FormGroupWrapperComponent } from '@zyra/components';
import { TextInput } from '@zyra/inputs';
import { __ } from '@wordpress/i18n';

const MinMax = ({ product, setProduct }) => {
	const [minMaxMeta, setMinMaxMeta] = useState({
		min_quantity: null,
		max_quantity: null,
		min_amount: null,
		max_amount: null,
	});

	useEffect(() => {
		if (!product?.meta_data) {
			return;
		}

		const found = product.meta_data.find(
			(item) => item.key === 'multivendorx_min_max_meta'
		);

		if (found?.value) {
			setMinMaxMeta(found.value);
		}
	}, [product]);

	const handleQuantityChange = (key, value) => {
		const newValue = {
			...minMaxMeta,
			[key]: value,
		};

		setMinMaxMeta(newValue);

		const KEY = 'multivendorx_min_max_meta';

		setProduct((prev) => {
			if (!prev) {
				return prev;
			}

			const updatedMeta = [...(prev.meta_data || [])];

			const index = updatedMeta.findIndex((m) => m.key === KEY);

			if (index !== -1) {
				updatedMeta[index].value = {
					...updatedMeta[index].value,
					...newValue,
				};
			} else {
				updatedMeta.push({
					key: KEY,
					value: {
						min_quantity: newValue.min_quantity || null,
						max_quantity: newValue.max_quantity || null,
						min_amount: newValue.min_amount || null,
						max_amount: newValue.max_amount || null,
					},
				});
			}

			return {
				...prev,
				meta_data: updatedMeta,
			};
		});
	};

	return (
		<CardComponent
			title={__('Min/Max', 'multivendorx')}
			desc={__('Lore ipsum dolor sit amet', 'multivendorx')}
		>
			<FormGroupWrapperComponent>
				{/* Quantity */}
				<FormGroupComponent cols={6} label={__('Quantity', 'multivendorx')}>
					<TextInput
						name="min_quantity"
						type="number"
						preText={__('Min', 'multivendorx')}
						value={minMaxMeta.min_quantity}
						onChange={(value) =>
							handleQuantityChange('min_quantity', value)
						}
					/>
				</FormGroupComponent>
				<FormGroupComponent cols={6}>
					<TextInput
						name="max_quantity"
						type="number"
						preText={__('Max', 'multivendorx')}
						value={minMaxMeta.max_quantity}
						onChange={(value) =>
							handleQuantityChange('max_quantity', value)
						}
					/>
				</FormGroupComponent>

				{/* Amount */}
				<FormGroupComponent cols={6} label={__('Amount', 'multivendorx')}>
					<TextInput
						name="min_amount"
						type="number"
						preText={__('Min', 'multivendorx')}
						value={minMaxMeta.min_amount}
						onChange={(value) =>
							handleQuantityChange('min_amount', value)
						}
					/>
				</FormGroupComponent>
				<FormGroupComponent cols={6}>
					<TextInput
						name="max_amount"
						type="number"
						preText={__('Max', 'multivendorx')}
						value={minMaxMeta.max_amount}
						onChange={(value) =>
							handleQuantityChange('max_amount', value)
						}
					/>
				</FormGroupComponent>
			</FormGroupWrapperComponent>
		</CardComponent>
	);
};

addFilter(
	'multivendorx_add_product_middle_section',
	'multivendorx/min_max',
	(
		content,
		product,
		setProduct,
		handleChange,
		productFields,
		typeFields,
		modules
	) => {
		return (
			<>
				{content}
				{modules?.includes('min-max') && product?.type === 'simple' && (
					<MinMax product={product} setProduct={setProduct} />
				)}
			</>
		);
	},
	50
);
