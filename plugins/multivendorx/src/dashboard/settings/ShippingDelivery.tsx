import axios from 'axios';
import { useEffect, useState } from 'react';
import {
	BasicInput,
	Column,
	Container,
	DynamicRowSetting,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	SuccessNotice,
	ToggleSetting,
} from 'zyra';
import ShippingRatesByCountry from './ShippingRatesByCountry';
import DistanceByZoneShipping from './DistanceByZoneShipping';
import { __ } from '@wordpress/i18n';

const ShippingDelivery = () => {
	const [formData, setFormData] = useState<{ [key: string]: any }>({}); // Use 'any' for simplicity here
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
	}, [appLocalizer.store_id]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
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
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
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
			<SuccessNotice message={successMsg} />
			{/* Only show ToggleSetting if shipping_methods has options */}
			{appLocalizer.shipping_methods &&
				appLocalizer.shipping_methods.length > 0 ? (
				<Container>
					<Column>
						<FormGroupWrapper>
							<FormGroup
								label={__('Method Type', 'multivendorx')}
								htmlFor="shipping_options"
							>
								<ToggleSetting

									descClass="settings-metabox-description"
									description={__(
										'Choose your preferred shipping method.',
										'multivendorx'
									)}
									options={appLocalizer.shipping_methods}
									value={formData.shipping_options || ''}
									onChange={(value: any) =>
										handleToggleChange(value, 'shipping_options')
									}
								/>
							</FormGroup>
						</FormGroupWrapper>


						{/* Zone by Shipping */}
						{formData.shipping_options === 'shipping_by_zone' && (
							<DistanceByZoneShipping />
						)}

						{/* Country-wise shipping */}
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
										<FormGroup
											label={__(
												`Default Shipping Price (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="multivendorx_shipping_type_price"
										>
											<BasicInput
												type="number"
												name="multivendorx_shipping_type_price"

												placeholder="0.00"
												value={formData.multivendorx_shipping_type_price || ''}
												onChange={handleChange}
											/>
											<div className="settings-metabox-description">
												{__(
													'This is the shipping cost applied to every order.',
													'multivendorx'
												)}
											</div>
										</FormGroup>

										<FormGroup
											label={__(
												`Per Product Additional Price (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="multivendorx_additional_product"
										>
											<BasicInput
												type="number"
												name="multivendorx_additional_product"

												placeholder="0.00"
												value={formData.multivendorx_additional_product || ''}
												onChange={handleChange}
											/>
											<div className="settings-metabox-description">
												{__(
													'This amount will be added to the Default Shipping Price for each additional product type in the cart.',
													'multivendorx'
												)}
											</div>
										</FormGroup>

										<FormGroup
											label={__(
												`Per Qty Additional Price (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="multivendorx_additional_qty"
										>
											<BasicInput
												type="number"
												name="multivendorx_additional_qty"

												placeholder="0.00"
												value={formData.multivendorx_additional_qty || ''}
												onChange={handleChange}
											/>
											<div className="settings-metabox-description">
												{__(
													'This amount will be added to the Default Shipping Price for each additional quantity of the same product.',
													'multivendorx'
												)}
											</div>
										</FormGroup>

										<FormGroup
											label={__(
												`Free Shipping Minimum Order Amount (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="free_shipping_amount"
										>
											<BasicInput
												type="number"
												name="free_shipping_amount"

												placeholder={__('NO Free Shipping', 'multivendorx')}
												value={formData.free_shipping_amount || ''}
												onChange={handleChange}
											/>
											<div className="settings-metabox-description">
												{__(
													"If the customer's order total exceeds this amount, shipping becomes free. Leave empty if you do not want to offer free shipping.",
													'multivendorx'
												)}
											</div>
										</FormGroup>

										<FormGroup
											label={__(
												`Local Pickup Cost (${appLocalizer.currency_symbol})`,
												'multivendorx'
											)}
											htmlFor="local_pickup_cost"
										>
											<BasicInput
												type="number"
												name="local_pickup_cost"

												placeholder="0.00"
												value={formData.local_pickup_cost || ''}
												onChange={handleChange}
											/>
											<div className="settings-metabox-description">
												{__(
													'This is the fee customers need to pay if they choose Local Pickup as the delivery option.',
													'multivendorx'
												)}
											</div>
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

						{/* Distance-based Shipping */}
						{formData.shipping_options ===
							'shipping_by_distance' && (
								<>
									<div className="form-group-title-wrapper">
										<div className="title">
											{__(
												'Distance-wise Shipping Configuration',
												'multivendorx'
											)}
										</div>
									</div>

									<FormGroupWrapper>
										{/* Default Cost */}
										<FormGroup
											label={__(
												`Default Cost (${appLocalizer.currency_symbol}) *`,
												'multivendorx'
											)}
											htmlFor="distance_default_cost"
										>


											<BasicInput
												type="number"
												name="distance_default_cost"

												placeholder="0.00"
												value={formData.distance_default_cost || ''}
												onChange={handleChange}
												min="0"
												step="0.01"
											/>
											<div className="settings-metabox-description">
												{__(
													'Apply default shipping charge to orders that do not match any configured distance-based shipping range.',
													'multivendorx'
												)}
											</div>
										</FormGroup>

										{/* Distance Type */}
										<FormGroup
											label={__('Distance Type', 'multivendorx')}
											htmlFor="distance_type"
										>
											<ToggleSetting

												descClass="settings-metabox-description"
												description={__(
													'Choose kilometers or miles based on your region so shipping charges are calculated correctly.',
													'multivendorx'
												)}
												options={[
													{ label: __('Kilometers (km)', 'multivendorx'), value: 'K' },
													{ label: __('Miles (mi)', 'multivendorx'), value: 'M' },
												]}
												value={formData.distance_type || ''}
												onChange={(value: any) =>
													handleToggleChange(value, 'distance_type')
												}
											/>
										</FormGroup>

										{/* Max Distance */}
										<FormGroup
											label={__('Max Distance', 'multivendorx')}
											htmlFor="distance_max"
										>
											<BasicInput
												type="number"
												name="distance_max"

												placeholder="0"
												value={formData.distance_max || ''}
												onChange={handleChange}
												min="0"
												step="0.1"
											/>
											<div className="settings-metabox-description">
											{__(
												'Set how far you are willing to deliver orders (leave blank to deliver everywhere).',
												'multivendorx'
											)}
										</div>
										</FormGroup>

										{/* Local Pickup Cost */}
										<FormGroup
											label={__(
												`Local Pickup Cost (${appLocalizer.currency_symbol}) (Optional)`,
												'multivendorx'
											)}
											htmlFor="distance_local_pickup_cost"
										>
											<BasicInput
												type="number"
												name="distance_local_pickup_cost"

												placeholder="0.00"
												value={formData.distance_local_pickup_cost || ''}
												onChange={handleChange}
												min="0"
												step="0.01"
											/>
											<div className="settings-metabox-description">
											{__(
												'Set the fee for customers who pick up their order themselves (use 0 for free pickup, or leave blank to turn it off).',
												'multivendorx'
											)}
										</div>
										</FormGroup>

										{/* Distance–Cost Rules */}
										<FormGroup
											label={__('Distance–Cost Rules', 'multivendorx')}
											desc= {__('Create custom shipping rates based on distance ranges. <br> For example, charge $5 for 0–10 km, $10 for 11–25 km, and $15 for 26–50 km. These rates replace the default fee so customers pay according to their delivery distance', 'multivendorx')}
										>
											<DynamicRowSetting
												keyName="distance_rules"
												addLabel={__('Add Rule', 'multivendorx')}
												value={formData.distance_rules || []}
												template={{
													fields: [
														{
															key: 'max_distance',
															type: 'number',
															label: __('Up to', 'multivendorx'),
															placeholder: __('Up to', 'multivendorx'),
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

												onChange={(updatedRules: any[]) => {
													const updated = {
														...formData,
														distance_rules: updatedRules,
													};
													setFormData(updated);
													autoSave(updated);
												}}
											/>
										</FormGroup>
									</FormGroupWrapper>
								</>
							)}
					</Column>
				</Container>
			)
				: (
					<div className="settings-metabox-description">
						{__(
							'No shipping methods are available at the moment.',
							'multivendorx'
						)}
					</div>
				)
			}
		</>
	);
};

export default ShippingDelivery;
