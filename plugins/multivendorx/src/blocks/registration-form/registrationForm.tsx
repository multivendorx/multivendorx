import { useState, useEffect, useMemo, useCallback } from 'react';
import './storeRegistration.scss';
import { FormViewer, getApiLink, ToggleSetting } from 'zyra';
import axios from 'axios';

const RegistrationForm = () => {
	const [loading, setLoading] = useState(false);
	const [responseMessage, setResponseMessage] = useState('');
	const [responseData, setResponseData] = useState<any[]>([]);
	const [stores, setStores] = useState<any[]>([]);
	const [selectedStore, setSelectedStore] = useState<any>(null);
	const [inputs, setInputs] = useState<Record<string, any>>({});
	const [allStoreData, setAllStoreData] = useState<any[]>([]);
	const [storeData, setStoreData] = useState<any>(null);
	const formData = registrationForm;

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
				const match = storeList.find((store: any) =>
					regData.some(
						(item: any) => String(item.id) === String(store.value)
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
						(item: any) => String(item.id) === String(match.value)
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
		setSelectedStore(store);

		const match = responseData.find(
			(item) => String(item.id) === String(val)
		);
		setInputs(match || {});

		const dataMatch = allStoreData.find(
			(item: any) => String(item.id) === String(val)
		);
		setStoreData(dataMatch || {});
	};

	const onSubmit = useCallback((submittedFormData: Record<string, any>) => {
		setLoading(true);

		const mappedData: Record<string, any> = {};

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
			url: getApiLink(registrationForm, 'store'),
			headers: {
				'X-WP-Nonce': registrationForm.nonce,
				registrations: 'registrations',
			},
			data: { formData: mappedData },
		})
			.then((response) => {
				setResponseMessage('Store created successfully');
				setLoading(false);
				if (response.data.redirect !== '') {
					window.open(response.data.redirect, '_self');
				}
			})
			.catch(() => {
				setResponseMessage('Error creating store');
				setLoading(false);
			});
	}, []);

	const memoizedCountryList = useMemo(() => registrationForm.country_list, []);
	const memoizedStateList = useMemo(() => registrationForm.state_list, []);

	return (
		<>
			{loading && (
				<section className="loader-wrapper">
					<div className="loader-item">
						<div className="three-body-dot"></div>
						<div className="three-body-dot"></div>
						<div className="three-body-dot"></div>
					</div>
				</section>
			)}
			{stores.length > 0 && (
				<>
					<div className="store-selector">
						<ToggleSetting
							 
							options={stores}
							value={selectedStore?.value || ''}
							onChange={(val: any) => handleStoreChange(val)}
						/>
					</div>

					{storeData?.note?.[0]?.note && (
						<div>
							<h4>Store Note</h4>
							<div className="store-note">
								<strong>Note:</strong> {storeData.note[0].note}
							</div>
						</div>
					)}
				</>
			)}

			<div>{registrationForm.content_before_form}</div>

			<FormViewer
				formFields={formData.settings}
				response={inputs}
				onSubmit={onSubmit}
				countryList={memoizedCountryList}
				stateList={memoizedStateList}
			/>
			<div>{registrationForm.content_after_form}</div>
			{responseMessage && (
				<div className="admin-notice-display-title">
					<i className="admin-font adminfont-icon-yes"></i>
					<p>{responseMessage}</p>
				</div>
			)}
		</>
	);
};

export default RegistrationForm;
