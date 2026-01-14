import { addFilter } from '@wordpress/hooks';
import { useEffect, useState } from 'react';
import { NestedComponent, BasicInput, Card } from 'zyra';
import { __ } from '@wordpress/i18n';

const MinMax = ({ product, setProduct }) => {
	const toggleCard = (cardId) => {
		const body = document.querySelector(`#${cardId} .card-body`);
		const arrow = document.querySelector(`#${cardId} .arrow-icon`);

		if (!body || !arrow) {
			return;
		}

		body.classList.toggle('hide-body');
		arrow.classList.toggle('rotate');
	};

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
						min_quantity: newValue.min_quantity || 0,
						max_quantity: newValue.max_quantity || 0,
						min_amount: newValue.min_amount || 0,
						max_amount: newValue.max_amount || 0,
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
		<Card
			title={__('Min/Max', 'multivendorx')}
			iconName="adminfont-pagination-right-arrow arrow-icon"
			toggle
		>
			<div className="form-group-wrapper">
				{/* Quantity */}
				<div className="form-group">
					<label>{__('Quantity', 'multivendorx')}</label>

					<BasicInput
						name="min_quantity"
						type="number"
						 
						preInsideText={__('Min', 'multivendorx')}
						value={minMaxMeta.min_quantity}
						onChange={(e) =>
							handleQuantityChange(
								'min_quantity',
								e.target.value
							)
						}
					/>

					<BasicInput
						name="max_quantity"
						type="number"
						 
						preInsideText={__('Max', 'multivendorx')}
						value={minMaxMeta.max_quantity}
						onChange={(e) =>
							handleQuantityChange(
								'max_quantity',
								e.target.value
							)
						}
					/>
				</div>

				{/* Amount */}
				<div className="form-group">
					<label>{__('Amount', 'multivendorx')}</label>

					<BasicInput
						name="min_amount"
						type="number"
						 
						preInsideText={__('Min', 'multivendorx')}
						value={minMaxMeta.min_amount}
						onChange={(e) =>
							handleQuantityChange(
								'min_amount',
								e.target.value
							)
						}
					/>

					<BasicInput
						name="max_amount"
						type="number"
						 
						preInsideText={__('Max', 'multivendorx')}
						value={minMaxMeta.max_amount}
						onChange={(e) =>
							handleQuantityChange(
								'max_amount',
								e.target.value
							)
						}
					/>
				</div>
			</div>
		</Card>

	);
};

addFilter(
	'product_min_max',
	'my-plugin/min_max',
	(content, product, setProduct) => {
		return (
			<>
				{content}
				<MinMax product={product} setProduct={setProduct} />
			</>
		);
	},
	10
);
