// RegistrationForm.tsx
/* global registrationForm */
import { useEffect, useRef, useState } from 'react';
import { getApiLink } from '@zyra/core';
import { ToggleInputFieldComponent } from '@zyra/inputs';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import VuloFormEmbed from './VuloFormEmbed';

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
 * store happens server-side (`MultiVendorX\VuloForm\SubmissionBridge`, hooked on
 * `vuloform_submission_created`) once VuloForm accepts the submission, reusing the existing
 * `multivendorx/v1/stores` REST route as-is. This component just handles the step wizard UI
 * around it, the store picker (for a vendor who already has one, re-editing it), and prefilling
 * the embed with that vendor's existing data.
 */
const RegistrationForm = () => {
	const [stores, setStores] = useState<StoreOption[]>([]);
	const [selectedStore, setSelectedStore] = useState<StoreOption | null>(
		null
	);
	const [inputs, setInputs] = useState<RegistrationResponse | null>(null);
	const [allStoreData, setAllStoreData] = useState<StoreData[]>([]);
	const [storeData, setStoreData] = useState<StoreData | null>(null);
	const [submitted, setSubmitted] = useState(false);

	// Step wizard state
	const [currentStep, setCurrentStep] = useState<1 | 2>(1);
	const [step1Completed, setStep1Completed] = useState<boolean>(false);

	const hasBeforeFormContent =
		registrationForm.content_before_form &&
		registrationForm.content_before_form.trim().length > 0;
	const hasStoreSelector = stores.length > 0;
	const shouldShowStep1 = hasBeforeFormContent || hasStoreSelector;

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

			// Auto-complete step 1 if there's nothing to show.
			if (!hasBeforeFormContent && storeList.length === 0) {
				setStep1Completed(true);
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

	const goToNextStep = () => {
		if (currentStep === 1 && shouldShowStep1) {
			setStep1Completed(true);
			setCurrentStep(2);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	// VuloForm's script swaps the <form> for a `.vuloform-message--success` node on success --
	// the store is created/updated server-side (SubmissionBridge), so this only needs to react
	// to it: show a confirmation, then send the vendor to their dashboard.
	const embedContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = document.querySelector(
			'.multivendorx-vuloform-embed'
		);

		if (!container) {
			return;
		}

		const observer = new MutationObserver((mutations) => {
			const succeeded = mutations.some((mutation) =>
				Array.prototype.some.call(
					mutation.addedNodes,
					(node: Node) =>
						node instanceof HTMLElement &&
						node.classList.contains('vuloform-message--success')
				)
			);

			if (succeeded) {
				setSubmitted(true);

				setTimeout(() => {
					if (registrationForm.dashboard_redirect_url) {
						window.location.href =
							registrationForm.dashboard_redirect_url;
					}
				}, 2000);
			}
		});

		observer.observe(container, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
		};
	}, [currentStep]);

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
		<div ref={embedContainerRef}>
			<VuloFormEmbed
				formId={registrationForm.vuloform_form_id}
				apiUrl={registrationForm.apiUrl}
				prefill={prefill}
			/>
			{submitted && (
				<div className="woocommerce-notices-wrapper">
					<ul className="woocommerce-message" role="alert">
						<li>
							{__(
								'Store registration submitted successfully',
								'multivendorx'
							)}
						</li>
					</ul>
				</div>
			)}
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

	// If there's no step 1 content, just show the form directly.
	if (!shouldShowStep1) {
		return (
			<div className="woocommerce">
				{storeSelector}
				{form}
				<div
					dangerouslySetInnerHTML={{
						__html: registrationForm.content_after_form,
					}}
				/>
			</div>
		);
	}

	return (
		<>
			<div className="multivendorxstep-wizard">
				<div className="multivendorxsteps-container">
					<div
						className={`multivendorxstep-item ${currentStep === 1 ? 'active' : ''} ${step1Completed ? 'completed' : ''}`}
						onClick={() =>
							currentStep === 2 && setCurrentStep(1)
						}
					>
						<div className="multivendorxstep-number">
							{step1Completed ? (
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
								>
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							) : (
								<span>1</span>
							)}
						</div>
						<h4 className="multivendorxstep-label">
							{__('Account', 'multivendorx')}
						</h4>
					</div>

					<div className="multivendorx-step-divider"></div>

					<div
						className={`multivendorxstep-item ${currentStep === 2 ? 'active' : ''}`}
					>
						<div className="multivendorxstep-number">
							<span>2</span>
						</div>
						<h4 className="multivendorxstep-label">
							{__('Store info', 'multivendorx')}
						</h4>
					</div>
				</div>
				<div className="multivendorxprogress-bar">
					<div
						className="multivendorxprogress-fill"
						style={{ width: currentStep === 1 ? '50%' : '100%' }}
					></div>
				</div>
			</div>

			{currentStep === 1 && (
				<div className="multivendorxstep-content multivendorxstep-1-content">
					{stores.length > 0 && (
						<div className="multivendorxstore-selector-section">
							<h3>{__('Select Your Store', 'multivendorx')}</h3>
							{storeSelector}
						</div>
					)}

					{registrationForm.content_before_form && (
						<div
							className="multivendorxbefore-form-content"
							dangerouslySetInnerHTML={{
								__html: registrationForm.content_before_form,
							}}
						/>
					)}

					{registrationForm.is_user_logged_in && (
						<div className="multivendorxstep-actions">
							<button onClick={goToNextStep}>
								{__('Continue to Store Details', 'multivendorx')}
							</button>
						</div>
					)}
				</div>
			)}

			{currentStep === 2 && (
				<div className="multivendorxstep-content">
					<div className="multivendorxform-header">
						<p>Step 2 of 2</p>
						<h3>{__('Tell us about your store', 'multivendorx')}</h3>
						<p>
							{__(
								'This information will be reviewed by our team before your store goes live. Please fill it in accurately.',
								'multivendorx'
							)}
						</p>
					</div>

					{stores.length > 0 && selectedStore && (
						<div className="multivendorxselected-store-info">
							<strong>{__('Selected Store:', 'multivendorx')}</strong>{' '}
							{selectedStore.label}
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
			)}
		</>
	);
};

export default RegistrationForm;
