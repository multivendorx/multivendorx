/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DynamicRowSetting, FormGroup, getApiLink } from 'zyra';
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
interface CountryItem {
	label?:
		| {
				label?: string;
				value?: string;
		  }
		| string;
	value?: string;
}
const ShippingRatesByCountry: React.FC = () => {
	const [rates, setRates] = useState<ShippingCountryRate[]>([]);

	const countries = appLocalizer?.country_list || {};
	const statesByCountry = appLocalizer?.state_list || {};

	useEffect(() => {
		if (!appLocalizer?.store_id) {
			return;
		}

		const fetchShippingRates = async () => {
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
					shippingRates.map((r: ShippingCountryRate) => ({
						country: r.country || '',
						cost: r.cost || '',
						states: Array.isArray(r.states) ? r.states : [],
					}))
				);
			} catch (error) {
				console.error('Failed to fetch shipping rates:', error);
			}
		};

		fetchShippingRates();
	}, []);

	const autoSave = async (updatedRates: ShippingCountryRate[]) => {
		setRates(updatedRates);
		try {
			await axios.post(
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
		} catch (error) {
			console.error('Failed to save:', error);
		}
	};

	/** FIX COUNTRY OPTIONS */
	const countryOptions = Array.isArray(countries)
		? countries.map((item: CountryItem) => ({
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
				size: '14rem',
				options: [
					{
						label: __('Everywhere Else', 'multivendorx'),
						value: 'everywhere',
					},
					...countryOptions,
				],
			},
			{
				key: 'cost',
				type: 'number',
				size: '8rem',
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
				size: '14rem',
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

	return (
		<>
			{/* {error && 
				<Notice
					type="error"
					message={ error }
					displayPosition="notice"
				/>
			} */}
			<FormGroup>
			<DynamicRowSetting
				keyName="country-rates"
				template={countryTemplate}
				value={rates}
				addLabel={__('Add Country', 'multivendorx')}
				onChange={(updatedCountries: ShippingCountryRate[]) => {
					const fixed = updatedCountries.map((r) => ({
						...r,
						states: r.states || [],
					}));
					autoSave(fixed);
				}}
				/** Render nested states inside the country row */
				childrenRenderer={(
					countryRow: ShippingCountryRate,
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
							<div className="state-title">
								{__('State / Region Rates', 'multivendorx')}
							</div>

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
								onChange={(
									updatedStates: ShippingStateRate[]
								) => {
									const clone = [...rates];
									clone[countryIndex].states = updatedStates;
									autoSave(clone);
								}}
							/>
						</div>
					);
				}}
			/>
			</FormGroup>
		</>
	);
};

export default ShippingRatesByCountry;
