import DistanceByZoneShipping from '@/dashboard/settings/DistanceByZoneShipping';
import ShippingRatesByCountry from '@/dashboard/settings/ShippingRatesByCountry';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
	BasicInputUI,
	Card,
	Column,
	Container,
	DynamicRowSetting,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	ComponentStatusView,
	
	ToggleSettingUI,
	Notice,
} from 'zyra';

const ShippingSettings = ({ id, data }: { id: string | null; data: any }) => {
	const [formData, setFormData] = useState<{ [key: string]: any }>({}); // Use 'any' for simplicity here
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) {
			return;
		}

		axios
			.get(getApiLink(appLocalizer, `store/${id}`), {
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
					}
				}

				setFormData((prev) => ({ ...prev, ...data }));
			});
	}, [id]);

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
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg('Store saved successfully!');
			}
		});
	};

	return (
		<>
			<Notice
				message={successMsg}
				displayPosition='float'
				title={__('Great!', 'multivendorx')}
			/>
			<Container>
				{appLocalizer.shipping_methods &&
				appLocalizer.shipping_methods.length > 0 ? (
					<Column>
						<Card title={__('Method type', 'multivendorx')}>
							<FormGroupWrapper>
								<FormGroup
									row
									desc={__(
										'Choose your preferred payment method.',
										'multivendorx'
									)}
								>
									<ToggleSettingUI
										options={appLocalizer.shipping_methods}
										value={formData.shipping_options || ''}
										onChange={(value: any) =>
											handleToggleChange(
												value,
												'shipping_options'
											)
										}
									/>
								</FormGroup>
							</FormGroupWrapper>

							{/* //zone by shipping */}
							{formData.shipping_options ===
								'shipping_by_zone' && (
								<DistanceByZoneShipping id={id} />
							)}

							{/* country wise shipping */}
							{formData.shipping_options ===
								'shipping_by_country' && (
								<>
									<div className="form-group-title-wrapper">
										<div className="title">
											{__(
												'Default Shipping Rules',
												'multivendorx'
											)}
										</div>
										<div className="des">
											{__(
												'Set base rates that apply to all orders',
												'multivendorx'
											)}
										</div>
									</div>
									<FormGroupWrapper>
										{/* Default Shipping Price */}
										<FormGroup
											row
											label={__(
												`Default Shipping Price (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="multivendorx_shipping_type_price"
										>
											<BasicInputUI
												type="number"
												name="multivendorx_shipping_type_price"
												size="12rem"
												placeholder={__(
													'0.00',
													'multivendorx'
												)}
												value={
													formData.multivendorx_shipping_type_price ||
													''
												}
												onChange={(value: string) =>
													handleChange(
														'multivendorx_shipping_type_price',
														value
													)
												}
												desc={__(
													'This is the shipping cost applied to every order.',
													'multivendorx'
												)}
											/>
											<div className="settings-metabox-description">
												{__(
													'This is the shipping cost applied to every order.',
													'multivendorx'
												)}
											</div>
										</FormGroup>
										{/* Per Product Additional Price */}
										<FormGroup
											row
											label={__(
												`Per Product Additional Price (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="multivendorx_additional_product"
											desc={__(
												'This amount will be added to the Default Shipping Price for each additional product type in the cart. Example: If Default Shipping is $5 and this is set to $2, a customer buying Product A and Product B will pay $5 (for Product A) + $2 (for Product B) = $7 total shipping.',
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="multivendorx_additional_product"
												size="12rem"
												placeholder={__(
													'0.00',
													'multivendorx'
												)}
												value={
													formData.multivendorx_additional_product ||
													''
												}
												onChange={(value: string) =>
													handleChange(
														'multivendorx_additional_product',
														value
													)
												}
											/>
										</FormGroup>

										{/* Per Qty Additional Price */}
										<FormGroup
											row
											label={__(
												`Per Qty Additional Price (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="multivendorx_additional_qty"
											desc={__(
												'This amount will be added to the Default Shipping Price for each additional quantity of the same product. Example: If Default Shipping is $5 and this is set to $1, a customer buying 3 units of Product A will pay $5 (first unit) + $1 (second unit) + $1 (third unit) = $7 total shipping.',
												'multivendorx'
											)}
										>
											<BasicInputUI
												type="number"
												name="multivendorx_additional_qty"
												size="12rem"
												placeholder={__(
													'0.00',
													'multivendorx'
												)}
												value={
													formData.multivendorx_additional_qty ||
													''
												}
												onChange={(value: string) =>
													handleChange(
														'multivendorx_additional_qty',
														value
													)
												}
											/>
										</FormGroup>

										{/* Free Shipping Minimum Order Amount */}
										<FormGroup
											row
											label={__(
												`Free Shipping Minimum Order Amount (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="free_shipping_amount"
											desc={__(
												"If the customer's order total exceeds this amount, shipping becomes free. Leave this field empty if you do not want to offer free shipping.",
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
												onChange={(value: string) =>
													handleChange(
														'free_shipping_amount',
														value
													)
												}
											/>
										</FormGroup>

										{/* Local Pickup Cost */}
										<FormGroup
											row
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
												placeholder={__(
													'0.00',
													'multivendorx'
												)}
												value={
													formData.local_pickup_cost ||
													''
												}
												onChange={(value: string) =>
													handleChange(
														'local_pickup_cost',
														value
													)
												}
											/>
										</FormGroup>
									</FormGroupWrapper>
									<div className="form-group-title-wrapper">
										<div className="title">
											{__(
												'Country-Specific Rates',
												'multivendorx'
											)}
										</div>
										<div className="des">
											{__(
												'Country-specific rates will be added to the Default Shipping Price. If state/region rates are defined, the final shipping cost will be State Rate + Default Shipping Price.',
												'multivendorx'
											)}
										</div>
									</div>

									<ShippingRatesByCountry />
								</>
							)}

							{formData.shipping_options ===
								'shipping_by_distance' && (
								<>
									<FormGroupWrapper>
										<div className="form-group-title-wrapper">
											<div className="title">
												{__(
													'Distance-wise Shipping Configuration',
													'multivendorx'
												)}
											</div>
										</div>

										{/* Default Cost */}
										<FormGroup
											row
											label={__(
												`Default Cost (${appLocalizer.currency_symbol}) *`,
												'multivendorx'
											)}
											htmlFor="distance_default_cost"
										>
											<BasicInputUI
												type="number"
												name="distance_default_cost"
												placeholder={__(
													'0.00',
													'multivendorx'
												)}
												value={
													formData.distance_default_cost ||
													''
												}
												onChange={(value: string) =>
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
											row
											label={__(
												'Distance Type',
												'multivendorx'
											)}
											desc={__(
												'Choose your preferred shipping method.',
												'multivendorx'
											)}
										>
											<ToggleSettingUI
												options={[
													{
														label: 'Kilometers (km)',
														value: 'K',
													},
													{
														label: 'Miles (mi)',
														value: 'M',
													},
												]}
												value={
													formData.distance_type || ''
												}
												onChange={(value) =>
													handleToggleChange(
														value,
														'distance_type'
													)
												}
											/>
										</FormGroup>

										{/* Max Distance */}
										<FormGroup
											row
											label={__(
												'Max Distance',
												'multivendorx'
											)}
											htmlFor="distance_max"
										>
											<BasicInputUI
												type="number"
												name="distance_max"
												placeholder={__(
													'0',
													'multivendorx'
												)}
												value={
													formData.distance_max || ''
												}
												onChange={(value: string) =>
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
											row
											label={__(
												`Local Pickup Cost (${appLocalizer.currency_symbol}) (Optional)`,
												'multivendorx'
											)}
											htmlFor="distance_local_pickup_cost"
										>
											<BasicInputUI
												type="number"
												name="distance_local_pickup_cost"
												placeholder={__(
													'0.00',
													'multivendorx'
												)}
												value={
													formData.distance_local_pickup_cost ||
													''
												}
												onChange={(value: string) =>
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
											row
											label={__(
												'Distance-Cost Rules',
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
													updatedRules: any[]
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
									</FormGroupWrapper>
								</>
							)}
						</Card>
					</Column>
				) : (
					<ComponentStatusView
						title={__(
							'No shipping methods are available at the moment.',
							'multivendorx'
						)}
						desc={__(
							'Please enable or configure shipping methods to continue.',
							'multivendorx'
						)}
					/>
				)}
			</Container>
		</>
	);
};

export default ShippingSettings;
