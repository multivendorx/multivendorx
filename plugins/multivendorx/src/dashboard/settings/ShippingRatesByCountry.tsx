import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DynamicRowSetting, getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';

interface ShippingStateRate {
	state: string;
	cost: string;
}

interface ShippingCountryRate {
	country: string;
	cost: string;
	states: ShippingStateRate[];
}

const ShippingRatesByCountry: React.FC = () => {
	const [rates, setRates] = useState<ShippingCountryRate[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const countries = appLocalizer?.country_list || {};
	const statesByCountry = appLocalizer?.state_list || {};

	useEffect(() => {
		if (!appLocalizer?.store_id) {
			return;
		}

		const fetchShippingRates = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await axios.get(
					getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
					{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
				);

				let shippingRates = [];
				try {
					shippingRates =
						typeof response.data.multivendorx_shipping_rates ===
							'string'
							? JSON.parse(
								response.data.multivendorx_shipping_rates
							)
							: response.data.multivendorx_shipping_rates || [];
				} catch {
					shippingRates = [];
				}

				setRates(
					shippingRates.map((r: any) => ({
						country: r.country || '',
						cost: r.cost || '',
						states: Array.isArray(r.states) ? r.states : [],
					}))
				);
			} catch {
				setError('Failed to load shipping rates');
			} finally {
				setLoading(false);
			}
		};

		fetchShippingRates();
	}, []);

	const autoSave = async (updatedRates: ShippingCountryRate[]) => {
		setRates(updatedRates);
		try {
			await axios.put(
				getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
				{
					multivendorx_shipping_rates: JSON.stringify(updatedRates),
				},
				{
					headers: {
						'X-WP-Nonce': appLocalizer.nonce,
						'Content-Type': 'application/json',
					},
				}
			);
		} catch {
			setError('Failed to save shipping rates.');
		}
	};

	/** FIX COUNTRY OPTIONS */
	const countryOptions = Array.isArray(countries)
		? countries.map((item: any) => ({
			label: item.label?.label || item.label,
			value: item.label?.value || item.value,
		}))
		: Object.entries(countries).map(([value, label]) => ({
			label,
			value,
		}));

	const countryTemplate = {
		fields: [
			{
				key: 'country',
				type: 'select',
				label: __('Country', 'multivendorx'),
				placeholder: __('Select Country', 'multivendorx'),
				options: [
					{ label: __('Everywhere Else', 'multivendorx'), value: 'everywhere' },
					...countryOptions,
				],
			},
			{
				key: 'cost',
				type: 'number',
				label: __('Cost', 'multivendorx'),
				placeholder: '0.00',
			},
		],
	};

	const stateTemplate = {
		fields: [
			{
				key: 'state',
				type: 'select',
				label: __('State', 'multivendorx'),
				placeholder: __('Select State', 'multivendorx'),
				options: [],
			},
			{
				key: 'cost',
				type: 'number',
				label: __('Cost', 'multivendorx'),
				placeholder: '0.00',
			},
		],
	};

	if (loading) {
		return <div>{__('Loading shipping rates...', 'multivendorx')}</div>;
	}
	return (
		<div className="shipping-country-wrapper">
			{error && <div className="mvx-error">{error}</div>}

			<DynamicRowSetting
				keyName="country-rates"
				template={countryTemplate}
				value={rates}
				addLabel={__('Add Country', 'multivendorx')}
				onChange={(updatedCountries: any) => {
					const fixed = updatedCountries.map((r) => ({
						...r,
						states: r.states || [],
					}));
					autoSave(fixed);
				}}
				/** Render nested states inside the country row */
				childrenRenderer={(
					countryRow: { country: string; states: unknown },
					countryIndex: string | number
				) => {
					const code = countryRow.country?.toUpperCase() || '';
					const raw = statesByCountry[code];

					const stateOptions = raw
						? Object.entries(raw).map(([value, label]) => ({
							value,
							label,
						}))
						: [];

					if (stateOptions.length === 0) {
						return null;
					}

					return (
						<div className="state-inner-box">
							<h4 className="state-title">
								{__('State / Region Rates', 'multivendorx')}
							</h4>

							<DynamicRowSetting
								keyName={`state-rates-${countryIndex}`}
								template={{
									fields: [
										{
											...stateTemplate.fields[0],
											options: stateOptions,
										},
										stateTemplate.fields[1],
									],
								}}
								value={countryRow.states}
								addLabel={__(
									'Add State/Region',
									'multivendorx'
								)}
								onChange={(updatedStates: any) => {
									const clone = [...rates];
									clone[countryIndex].states = updatedStates;
									autoSave(clone);
								}}
							/>
						</div>
					);
				}}
			/>
		</div>
	);
};

export default ShippingRatesByCountry;
