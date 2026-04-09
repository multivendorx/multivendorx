/* global appLocalizer */
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
	BasicInputUI,
	Column,
	Container,
	DynamicRowSetting,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	ChoiceToggleUI,
	NoticeManager,
	SectionUI,
} from 'zyra';
import ShippingRatesByCountry from './ShippingRatesByCountry';
import DistanceByZoneShipping from './DistanceByZoneShipping';
import { __ } from '@wordpress/i18n';
interface FormData {
	shipping_options?: string;
	multivendorx_shipping_type_price?: string;
	multivendorx_additional_product?: string;
	multivendorx_additional_qty?: string;
	free_shipping_amount?: string;
	local_pickup_cost?: string;
	distance_default_cost?: string;
	distance_type?: string;
	distance_max?: string;
	distance_local_pickup_cost?: string;
	distance_rules?: Array<{ max_distance: string; cost: string }>;
	[key: string]:
		| string
		| Array<{ max_distance: string; cost: string }>
		| undefined;
}
interface DistanceRule {
	max_distance: string;
	cost: string;
}
const ShippingDelivery = () => {
	const [formData, setFormData] = useState<FormData>({});

	useEffect(() => {
		if (!appLocalizer.store_id) {
			return;
		}

		axios
			.get(getApiLink(appLocalizer, `store/${appLocalizer.store_id}`), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				const data = res.data || {};

				// Step 2a: parse distance_rules
				if (typeof data.distance_rules === 'string') {
					try {
						data.distance_rules = JSON.parse(data.distance_rules);
					} catch (err) {
						data.distance_rules = []; // fallback to empty array
						console.error(err);
					}
				}

				// Optional: parse multivendorx_shipping_rates if needed
				if (typeof data.multivendorx_shipping_rates === 'string') {
					try {
						data.multivendorx_shipping_rates = JSON.parse(
							data.multivendorx_shipping_rates
						);
					} catch (err) {
						data.multivendorx_shipping_rates = [];
						console.error(err);
					}
				}

				setFormData((prev) => ({ ...prev, ...data }));
			});
	}, [appLocalizer.store_id]);

	const handleChange = (key: string, value: string) => {
		const updated = { ...formData, [key]: value };
		setFormData(updated);
		autoSave(updated);
	};

	const handleToggleChange = (value: string, name?: string) => {
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name || 'shipping_options']: value,
			};
			autoSave(updated);
			return updated;
		});
	};

	const autoSave = (updatedData: Record<string, unknown>) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				NoticeManager.add({
					title: __('Great!', 'multivendorx'),
					message: __('Store saved successfully!', 'multivendorx'),
					type: 'success',
					position: 'float',
				});
			}
		});
	};
	const selectedMethodExists = appLocalizer.shipping_methods.some(
		(method) => method.value === formData.shipping_options
	);
	return (
		<>
			{/* Only show ChoiceToggle if shipping_methods has options */}
			{appLocalizer.shipping_methods &&
			appLocalizer.shipping_methods.length > 0 ? (
				<Container>
					<Column>
						<FormGroupWrapper>
							<FormGroup
								label={__('Method Type', 'multivendorx')}
								htmlFor="shipping_options"
								desc={__(
									'Choose your preferred shipping method.',
									'multivendorx'
								)}
							>
								<ChoiceToggleUI
									options={appLocalizer.shipping_methods}
									value={formData.shipping_options || ''}
									onChange={(value: string) =>
										handleToggleChange(
											value,
											'shipping_options'
										)
									}
								/>
							</FormGroup>

							{/* Zone by Shipping */}
							{formData.shipping_options === 'shipping_by_zone' &&
								selectedMethodExists && (
									<DistanceByZoneShipping />
								)}

							{/* Country-wise shipping */}
							{formData.shipping_options ===
								'shipping_by_country' &&
								selectedMethodExists && (
									<>
										<SectionUI
											title={__(
												'Default Shipping Rules',
												'multivendorx'
											)}
											desc={__(
												'Set base rates that apply to all orders',
												'multivendorx'
											)}
										/>

										<FormGroup
											label={__(
												`Default Shipping Price (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="multivendorx_shipping_type_price"
											desc={__(
												'This is the shipping cost applied to every order.',
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="multivendorx_shipping_type_price"
												placeholder="0.00"
												value={
													formData.multivendorx_shipping_type_price ||
													''
												}
												onChange={(value) =>
													handleChange(
														'multivendorx_shipping_type_price',
														value
													)
												}
											/>
										</FormGroup>

										<FormGroup
											label={__(
												`Per Product Additional Price (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="multivendorx_additional_product"
											desc={__(
												'This amount will be added to the Default Shipping Price for each additional product type in the cart.',
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="multivendorx_additional_product"
												placeholder="0.00"
												value={
													formData.multivendorx_additional_product ||
													''
												}
												onChange={(value) =>
													handleChange(
														'multivendorx_additional_product',
														value
													)
												}
											/>
										</FormGroup>

										<FormGroup
											label={__(
												`Per Qty Additional Price (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="multivendorx_additional_qty"
											desc={__(
												'This amount will be added to the Default Shipping Price for each additional quantity of the same product.',
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="multivendorx_additional_qty"
												placeholder="0.00"
												value={
													formData.multivendorx_additional_qty ||
													''
												}
												onChange={(value) =>
													handleChange(
														'multivendorx_additional_qty',
														value
													)
												}
											/>
										</FormGroup>

										<FormGroup
											label={__(
												`Free Shipping Minimum Order Amount (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="free_shipping_amount"
											desc={__(
												"If the customer's order total exceeds this amount, shipping becomes free. Leave empty if you do not want to offer free shipping.",
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="free_shipping_amount"
												placeholder={__(
													'NO Free Shipping',
													'multivendorx'
												)}
												value={
													formData.free_shipping_amount ||
													''
												}
												onChange={(value) =>
													handleChange(
														'free_shipping_amount',
														value
													)
												}
											/>
										</FormGroup>

										<FormGroup
											label={__(
												`Local Pickup Cost (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="local_pickup_cost"
											desc={__(
												'This is the fee customers need to pay if they choose Local Pickup as the delivery option.',
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="local_pickup_cost"
												placeholder="0.00"
												value={
													formData.local_pickup_cost ||
													''
												}
												onChange={(value) =>
													handleChange(
														'local_pickup_cost',
														value
													)
												}
											/>
										</FormGroup>

										<SectionUI
											title={__(
												'Country-Specific Rates',
												'multivendorx'
											)}
											desc={__(
												'Country-specific rates will be added to the Default Shipping Price. If state/region rates are defined, the final shipping cost will be State Rate + Default Shipping Price.',
												'multivendorx'
											)}
										/>

										<ShippingRatesByCountry />
									</>
								)}

							{/* Distance-based Shipping */}
							{formData.shipping_options ===
								'shipping_by_distance' &&
								selectedMethodExists && (
									<>
										<SectionUI
											title={__(
												'Distance-wise Shipping Configuration',
												'multivendorx'
											)}
										/>

										{/* Default Cost */}
										<FormGroup
											label={__(
												`Default Cost (${appLocalizer.currency_symbol}) *`,
												'multivendorx'
											)}
											htmlFor="distance_default_cost"
											desc={__(
												'Apply default shipping charge to orders that do not match any configured distance-based shipping range.',
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="distance_default_cost"
												placeholder="0.00"
												value={
													formData.distance_default_cost ||
													''
												}
												onChange={(value) =>
													handleChange(
														'distance_default_cost',
														value
													)
												}
												min="0"
											/>
										</FormGroup>

										{/* Distance Type */}
										<FormGroup
											label={__(
												'Distance Type',
												'multivendorx'
											)}
											htmlFor="distance_type"
											desc={__(
												'Choose kilometers or miles based on your region so shipping charges are calculated correctly.',
												'multivendorx'
											)}
										>
											<ChoiceToggleUI
												options={[
													{
														key: 'K',
														label: __(
															'Kilometers (km)',
															'multivendorx'
														),
														value: 'K',
													},
													{
														key: 'M',
														label: __(
															'Miles (mi)',
															'multivendorx'
														),
														value: 'M',
													},
												]}
												value={
													formData.distance_type || ''
												}
												onChange={(value: string) =>
													handleToggleChange(
														value,
														'distance_type'
													)
												}
											/>
										</FormGroup>

										{/* Max Distance */}
										<FormGroup
											label={__(
												'Max Distance',
												'multivendorx'
											)}
											htmlFor="distance_max"
											desc={__(
												'Set how far you are willing to deliver orders (leave blank to deliver everywhere).',
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="distance_max"
												placeholder="0"
												value={
													formData.distance_max || ''
												}
												onChange={(value) =>
													handleChange(
														'distance_max',
														value
													)
												}
												min="0"
											/>
										</FormGroup>

										{/* Local Pickup Cost */}
										<FormGroup
											label={__(
												`Local Pickup Cost (${appLocalizer.currency_symbol}) (Optional)`,
												'multivendorx'
											)}
											htmlFor="distance_local_pickup_cost"
											desc={__(
												'Set the fee for customers who pick up their order themselves (use 0 for free pickup, or leave blank to turn it off).',
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="distance_local_pickup_cost"
												placeholder="0.00"
												value={
													formData.distance_local_pickup_cost ||
													''
												}
												onChange={(value) =>
													handleChange(
														'distance_local_pickup_cost',
														value
													)
												}
												min="0"
											/>
										</FormGroup>

										{/* Distance–Cost Rules */}
										<FormGroup
											label={__(
												'Distance–Cost Rules',
												'multivendorx'
											)}
											desc={__(
												'Create custom shipping rates based on distance ranges. <br> For example, charge $5 for 0–10 km, $10 for 11–25 km, and $15 for 26–50 km. These rates replace the default fee so customers pay according to their delivery distance',
												'multivendorx'
											)}
										>
											<DynamicRowSetting
												keyName="distance_rules"
												addLabel={__(
													'Add Rule',
													'multivendorx'
												)}
												value={
													formData.distance_rules ||
													[]
												}
												template={{
													fields: [
														{
															key: 'max_distance',
															type: 'number',
															label: __(
																'Up to',
																'multivendorx'
															),
															placeholder: __(
																'Up to',
																'multivendorx'
															),
															step: '0.1',
															min: '0',
														},
														{
															key: 'cost',
															type: 'number',
															label: __(
																`Cost (${appLocalizer.currency_symbol})`,
																'multivendorx'
															),
															placeholder: __(
																`Cost ${appLocalizer.currency_symbol}`,
																'multivendorx'
															),
															step: '0.01',
															min: '0',
														},
													],
												}}
												onChange={(
													updatedRules: DistanceRule[]
												) => {
													const updated = {
														...formData,
														distance_rules:
															updatedRules,
													};
													setFormData(updated);
													autoSave(updated);
												}}
											/>
										</FormGroup>
									</>
								)}
						</FormGroupWrapper>
					</Column>
				</Container>
			) : (
				<div className="desc">
					{__(
						'No shipping methods are available at the moment.',
						'multivendorx'
					)}
				</div>
			)}
		</>
	);
};

export default ShippingDelivery;
