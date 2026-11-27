// RegistrationForm.tsx
/* global registrationForm */
import { useEffect, useState } from 'react';
import { getApiLink } from '@zyra/core';
import { ToggleInputFieldComponent } from '@zyra/inputs';
import { VuloFormEmbed } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

type StoreOption = {
	label: string;
	value: string | number;
};

type RegistrationResponse = {
	id: string | number;
	name?: string;
	description?: string;
	slug?: string;
	[key: string]: string | number | boolean | null | undefined;
};

type StoreNote = {
	note: string;
};

type StoreData = {
	id: string | number;
	note?: StoreNote[];
};

/**
 * The form itself is now built and rendered in VuloForm -- actually registering/updating the
 * store happens server-side (`MultiVendorX\Integrations\VuloForm\Integration::maybe_register_store()`,
 * hooked on `vuloform_submission_created`) once VuloForm accepts the submission, reusing the
 * existing `multivendorx/v1/stores` REST route as-is. This component renders the account/login
 * status and store picker (for a vendor who already has one, re-editing it) as a single page,
 * directly above the embed, instead of as a separate wizard step, and prefills the embed with
 * that vendor's existing data.
 */
const RegistrationForm = () => {
	const [stores, setStores] = useState<StoreOption[]>([]);
	const [selectedStore, setSelectedStore] = useState<StoreOption | null>(
		null
	);
	const [inputs, setInputs] = useState<RegistrationResponse | null>(null);
	const [allStoreData, setAllStoreData] = useState<StoreData[]>([]);
	const [storeData, setStoreData] = useState<StoreData | null>(null);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(registrationForm, `stores`),
			headers: { 'X-WP-Nonce': registrationForm.nonce },
			params: { store_registration: true },
		}).then((res) => {
			const data = res.data || {};
			const storeList = data.all_stores || [];
			const regData = data.response || [];
			const returnedStoreData = data.store_data || [];

			setAllStoreData(returnedStoreData);
			setStores(storeList);

			if (storeList.length > 0 && regData.length > 0) {
				const match = storeList.find((store: StoreOption) =>
					regData.some(
						(item: RegistrationResponse) =>
							String(item.id) === String(store.value)
					)
				);

				if (match) {
					setSelectedStore(match);

					const matchData = regData.find(
						(item: RegistrationResponse) =>
							String(item.id) === String(match.value)
					);

					if (matchData) {
						setInputs(matchData);
					}

					const dataMatch = returnedStoreData.find(
						(item: StoreData) =>
							String(item.id) === String(match.value)
					);
					if (dataMatch) {
						setStoreData(dataMatch);
					}
				}
			}
		});
	}, []);

	const handleStoreChange = (val: string) => {
		const store = stores.find((s) => s.value === val);
		setSelectedStore(store || null);

		const dataMatch = allStoreData.find(
			(item) => String(item.id) === String(val)
		);
		setStoreData(dataMatch || null);
	};

	// VuloForm's script swaps the <form> for a `.vuloform-message--success` node on success --
	// the store is created/updated server-side (Integration::maybe_register_store()), so this only needs to react
	// to it by sending the vendor to their dashboard. VuloForm's own success message is shown
	// in its place, so no separate confirmation is rendered here.
	const handleRegistrationSubmitted = () => {
		setTimeout(() => {
			if (registrationForm.dashboard_redirect_url) {
				window.location.href = registrationForm.dashboard_redirect_url;
			}
		}, 2000);
	};

	const prefill = inputs
		? {
				name: String(inputs.name ?? ''),
				description: String(inputs.description ?? ''),
				phone: String(inputs.phone ?? ''),
				paypal_email: String(inputs.paypal_email ?? ''),
				address: String(inputs.address ?? ''),
			}
		: undefined;

	const form = registrationForm.vuloform_form_id > 0 && (
		<div>
			<VuloFormEmbed
				formId={registrationForm.vuloform_form_id}
				apiUrl={registrationForm.apiUrl}
				// Without this, the embed fetch runs anonymous and VuloForm never hands the
				// rendered form a `restNonce` -- the registering vendor's own store-creation
				// submission would carry no WP identity at all (Integration::maybe_register_store()
				// then has nothing to attribute the store to).
				nonce={registrationForm.nonce}
				className="multivendorx-vuloform-embed"
				queryParams={prefill}
				onSubmitted={handleRegistrationSubmitted}
			/>
		</div>
	);

	const storeSelector = stores.length > 0 && (
		<div className="store-selector">
			<ToggleInputFieldComponent
				options={stores}
				value={selectedStore?.value || ''}
				onChange={(val) => handleStoreChange(val)}
			/>

			{storeData?.note?.[0]?.note && (
				<div>
					<h4>{__('Store Note', 'multivendorx')}</h4>
					<div className="store-note">
						<strong>{__('Note', 'multivendorx')}:</strong>{' '}
						{storeData.note[0].note}
					</div>
				</div>
			)}
		</div>
	);

	// Single page: the store picker, then the VuloForm embed, which now renders the
	// account/login status itself as the locked first field of its own schema
	// (Templates::locked_login_field()) -- no step wizard, no page break, no separate
	// content_before_form render here.
	return (
		<div className="multivendorxregistration-page">
			{stores.length > 0 && (
				<div className="multivendorxstore-selector-section">
					<h3>{__('Select Your Store', 'multivendorx')}</h3>
					{storeSelector}
				</div>
			)}

			{form}

			{registrationForm.content_after_form && (
				<div
					className="multivendorxafter-form-content"
					dangerouslySetInnerHTML={{
						__html: registrationForm.content_after_form,
					}}
				/>
			)}
		</div>
	);
};

export default RegistrationForm;
