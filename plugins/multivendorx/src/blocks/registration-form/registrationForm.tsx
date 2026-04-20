// RegistrationForm.tsx
/* global registrationForm, */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { FormViewer, getApiLink, ChoiceToggle } from 'zyra';
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

const RegistrationForm = () => {
	const [responseMessage, setResponseMessage] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);
	const [responseData, setResponseData] = useState<RegistrationResponse[]>(
		[]
	);
	const [stores, setStores] = useState<StoreOption[]>([]);
	const [selectedStore, setSelectedStore] = useState<StoreOption | null>(
		null
	);
	const [inputs, setInputs] = useState<
		RegistrationResponse | Record<string, string | number | boolean>
	>({});
	const [allStoreData, setAllStoreData] = useState<StoreData[]>([]);
	const [storeData, setStoreData] = useState<StoreData | null>(null);
	const formData = registrationForm;

	// Step wizard state
	const [currentStep, setCurrentStep] = useState<1 | 2>(1);
	const [step1Completed, setStep1Completed] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	// Check if step 1 has content to show
	const hasBeforeFormContent =
		registrationForm.content_before_form &&
		registrationForm.content_before_form.trim().length > 0;
	const hasStoreSelector = stores.length > 0;
	const shouldShowStep1 = hasBeforeFormContent || hasStoreSelector;

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(registrationForm, `store`),
			headers: { 'X-WP-Nonce': registrationForm.nonce },
			params: { store_registration: true },
		}).then((res) => {
			const data = res.data || {};
			const storeList = data.all_stores || [];
			const regData = data.response || [];
			const returnedStoreData = data.store_data || [];

			setAllStoreData(returnedStoreData);
			//Prevent unnecessary re-renders
			setStores((prev) => {
				if (JSON.stringify(prev) !== JSON.stringify(storeList)) {
					return storeList;
				}
				return prev;
			});

			setResponseData((prev) => {
				if (JSON.stringify(prev) !== JSON.stringify(regData)) {
					return regData;
				}
				return prev;
			});

			if (storeList.length > 0 && regData.length > 0) {
				const match = storeList.find((store) =>
					regData.some(
						(item) => String(item.id) === String(store.value)
					)
				);

				if (match) {
					setSelectedStore(match);

					const matchData = regData.find(
						(item) => String(item.id) === String(match.value)
					);

					if (matchData) {
						setInputs(matchData);
					}

					const dataMatch = returnedStoreData.find(
						(item) => String(item.id) === String(match.value)
					);
					if (dataMatch) {
						setStoreData(dataMatch);
					}
				}
			}

			// Auto-complete step 1 if there's nothing to show
			if (!shouldShowStep1) {
				setStep1Completed(true);
			}
		});
	}, []);

	const handleStoreChange = (val: string) => {
		const store = stores.find((s) => s.value === val);
		setSelectedStore(store);

		const match = responseData.find(
			(item) => String(item.id) === String(val)
		);
		setInputs(match || {});

		const dataMatch = allStoreData.find(
			(item) => String(item.id) === String(val)
		);
		setStoreData(dataMatch || {});
	};

	useEffect(() => {
		const backup = sessionStorage.getItem('multivendorxRegistrationForm');

		if (backup) {
			try {
				const parsed = JSON.parse(backup);
				setInputs(parsed); // restore into FormViewer
			} catch (e) {
				console.error('Invalid backup data');
			}
		}
	}, []);

	// Navigate to next step
	const goToNextStep = () => {
		if (currentStep === 1 && shouldShowStep1) {
			setStep1Completed(true);
			setCurrentStep(2);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	// Navigate to previous step
	const goToPreviousStep = () => {
		if (currentStep === 2) {
			setCurrentStep(1);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const onSubmit = useCallback(
		(submittedFormData: Record<string, string | number | boolean>) => {
			setIsSubmitting(true);

			sessionStorage.setItem(
				'multivendorxRegistrationForm',
				JSON.stringify(submittedFormData)
			);
			setInputs(submittedFormData);

			const mappedData: Record<string, string | number | boolean> = {};

			if (submittedFormData['name']) {
				mappedData['name'] = submittedFormData['name'];
			}
			if (submittedFormData['description']) {
				mappedData['description'] = submittedFormData['description'];
			}
			if (submittedFormData['slug']) {
				mappedData['slug'] = submittedFormData['slug'];
			}

			Object.keys(submittedFormData).forEach((key) => {
				if (!['name', 'description', 'slug'].includes(key)) {
					mappedData[key] = submittedFormData[key];
				}
			});

			axios({
				method: 'POST',
				url: getApiLink(registrationForm, 'stores'),
				headers: {
					'Content-Type': 'multipart/form-data',
					'X-WP-Nonce': registrationForm.nonce,
					registrations: 'registrations',
				},
				data: { formData: mappedData },
			})
				.then((response) => {
					setResponseMessage({
						type: 'success',
						message: __(
							'Store created successfully',
							'multivendorx'
						),
					});
					setIsSubmitting(false);

					sessionStorage.removeItem('multivendorxRegistrationForm');
					if (response.data.redirect !== '') {
						window.open(response.data.redirect, '_self');
					}
				})
				.catch(() => {
					setResponseMessage({
						type: 'error',
						message: __('Error creating store', 'multivendorx'),
					});
					setIsSubmitting(false);
				});
		},
		[]
	);

	const memoizedCountryList = useMemo(
		() => registrationForm.country_list,
		[]
	);
	const memoizedStateList = useMemo(() => registrationForm.state_list, []);

	// If there's no step 1 content, just show the form directly
	if (!shouldShowStep1) {
		return (
			<div className="woocommerce">
				{stores.length > 0 && (
					<>
						<div className="store-selector">
							<ChoiceToggle
								options={stores}
								value={selectedStore?.value || ''}
								onChange={(val) => handleStoreChange(val)}
							/>
						</div>

						{storeData?.note?.[0]?.note && (
							<div>
								<h4>{__('Store Note', 'multivendorx')}</h4>
								<div className="store-note">
									<strong>
										{__('Note', 'multivendorx')}:
									</strong>{' '}
									{storeData.note[0].note}
								</div>
							</div>
						)}
					</>
				)}

				<FormViewer
					formFields={formData.settings}
					response={inputs}
					onSubmit={onSubmit}
					countryList={memoizedCountryList}
					stateList={memoizedStateList}
				/>
				<div
					dangerouslySetInnerHTML={{
						__html: registrationForm.content_after_form,
					}}
				/>
				{responseMessage && (
					<div className="woocommerce-notices-wrapper">
						<ul
							className={
								responseMessage.type === 'success'
									? 'woocommerce-message'
									: 'woocommerce-error'
							}
							role="alert"
						>
							<li>{responseMessage.message}</li>
						</ul>
					</div>
				)}
			</div>
		);
	}

	return (
		<>
			<div className="multivendorxstep-wizard">
				<div className="multivendorxsteps-container">
					{/* Step 1 */}
					<div
						className={`multivendorxstep-item ${currentStep === 1 ? 'active' : ''} ${step1Completed ? 'completed' : ''}`}
						onClick={() => currentStep === 2 && goToPreviousStep()}
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
							{' '}
							{__('Account', 'multivendorx')}
						</h4>
					</div>
						
					<div className="multivendorx-step-divider"></div>
					{/* Step 2 */}
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

			{/* Step 1 */}
			{currentStep === 1 && (
				<div className="multivendorxstep-content multivendorxstep-1-content">
					{stores.length > 0 && (
						<div className="multivendorxstore-selector-section">
							<h3>{__('Select Your Store', 'multivendorx')}</h3>
							<div className="store-selector">
								<ChoiceToggle
									options={stores}
									value={selectedStore?.value || ''}
									onChange={(val) => handleStoreChange(val)}
								/>
							</div>

							{storeData?.note?.[0]?.note && (
								<div className="multivendorxstore-note">
									<h4>{__('Store Note', 'multivendorx')}</h4>
									<div className="store-note">
										<strong>
											{__('Note', 'multivendorx')}:
										</strong>{' '}
										{storeData.note[0].note}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Step 1 Main Content: content_before_form */}
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
							<button className="" onClick={goToNextStep}>
								{__('Continue to Store Details', 'multivendorx')}
							</button>
						</div>
					)}
				</div>
			)}

			{/* Step 2 */}
			{currentStep === 2 && (
				<div className="multivendorxstep-content">
					<div className="multivendorxform-header">
						<p>Step 2 of 2</p>
						<h3>
							{__('Tell us about your store', 'multivendorx')}
						</h3>
						<p>
							{__(
								'This information will be reviewed by our team before your store goes live. Please fill it in accurately.',
								'multivendorx'
							)}
						</p>
					</div>

					{/* Store selector and note (if any) for step 2 */}
					{stores.length > 0 && selectedStore && (
						<div className="multivendorxselected-store-info">
							<strong>
								{__('Selected Store:', 'multivendorx')}
							</strong>{' '}
							{selectedStore.label}
						</div>
					)}

					<FormViewer
						formFields={formData.settings}
						response={inputs}
						onSubmit={onSubmit}
						countryList={memoizedCountryList}
						stateList={memoizedStateList}
					/>

					{/* After Form Content */}
					{registrationForm.content_after_form && (
						<div
							className="multivendorxafter-form-content"
							dangerouslySetInnerHTML={{
								__html: registrationForm.content_after_form,
							}}
						/>
					)}

					{/* Response Message */}
					{responseMessage && (
						<div className="woocommerce-notices-wrapper">
							<ul
								className={
									responseMessage.type === 'success'
										? 'woocommerce-message'
										: 'woocommerce-error'
								}
								role="alert"
							>
								<li>{responseMessage.message}</li>
							</ul>
						</div>
					)}

					{/* <div className="multivendorxstep-actions">
						<button
							className="multivendorxbtn multivendorxbtn-secondary"
							onClick={goToPreviousStep}
							disabled={isSubmitting}
						>
							{__('Back', 'multivendorx')}
						</button>
					</div> */}
				</div>
			)}
		</>
	);
};

export default RegistrationForm;
