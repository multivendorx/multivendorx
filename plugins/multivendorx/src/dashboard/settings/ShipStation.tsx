import { useEffect, useState } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import {
	BasicInputUI,
	ButtonInputUI,
	Column,
	Container,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	NoticeManager,
	SelectInputUI
} from "zyra";

const ShipStation = () => {
	const [credential, setCredential] = useState(null);
	const [formData, setFromData] = useState({});

	const storeId = appLocalizer.store_id;
	const apiBase = `ship-stations/${storeId}`;

	const fetchCredential = () => {
		axios
			.get(getApiLink(appLocalizer, apiBase), {
				headers: { "X-WP-Nonce": appLocalizer.nonce },
			})
			.then((res) => setCredential(res.data))
			.catch(() => setCredential(null));
	};

	const fetchStore = () => {
		axios
			.get(getApiLink(appLocalizer, `stores/${storeId}`), {
				headers: { "X-WP-Nonce": appLocalizer.nonce },
			})
			.then((res) => setFromData(res.data))
			.catch(() => setFromData({}));
	};

	useEffect(() => {
		if (storeId) {
			fetchCredential();
			fetchStore();
		}
	}, [storeId]);

	const handleAddCredential = () => {
		axios
			.post(
				getApiLink(appLocalizer, "ship-stations"),
				{ id: storeId },
				{ headers: { "X-WP-Nonce": appLocalizer.nonce } }
			)
			.then((res) => setCredential(res.data));
	};

	const handleRevokeCredential = () => {
		axios
			.delete(getApiLink(appLocalizer, apiBase), {
				headers: { "X-WP-Nonce": appLocalizer.nonce },
			})
			.then(() => setCredential(null));
	};

	const hasCredential = credential && credential.key_id;

	const handleChange = (name: string, value: string) => {
		const updated = { ...formData, [name]: value };
		setFromData(updated);
		autoSave(updated);
	};

	const autoSave = (updatedData: Record<string, unknown>) => {
		if (!appLocalizer.store_id) {
			return;
		}

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `stores/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		})
			.then(() => {
				NoticeManager.add({
					title: __('Success', 'multivendorx'),
					message: __('Store saved successfully!', 'multivendorx'),
					type: 'success',
					position: 'float',
				});
			})
			.catch((error) => {
				console.error('Save error:', error);
			});
	};

	return (
		<Container>
			<Column>
				<FormGroupWrapper>

					<ButtonInputUI
						buttons={[
							hasCredential
								? {
									icon: "trash",
									text: "Revoke Credential",
									color: "red",
									onClick: handleRevokeCredential,
								}
								: {
									icon: "plus",
									text: "Add Credential",
									color: "purple",
									onClick: handleAddCredential,
								},
						]}
					/>

					{hasCredential && (
						<>
							<FormGroup label={__('Consumer Key', 'multivendorx')}>
								<BasicInputUI value={credential.consumer_key || ''} readOnly />
							</FormGroup>

							<FormGroup label={__('Consumer Secret', 'multivendorx')}>
								<BasicInputUI value={credential.consumer_secret || ''} readOnly />
							</FormGroup>

							<FormGroup label={__('Auth Key', 'multivendorx')}>
								<BasicInputUI value={credential.multivendorx_auth_key || ''} readOnly />
							</FormGroup>

						</>
					)}
					<FormGroup label={__('Export Order Statuses', 'multivendorx')}>
						<SelectInputUI
							type="multi-select"
							options={appLocalizer.order_statuses}
							value={formData.export_statuses || []}
							onChange={(val) => handleChange('export_statuses', val)}
							placeholder="Select statuses"
							selectDeselect={true}
						/>
					</FormGroup>

					<FormGroup label={__('Shipped Order Status', 'multivendorx')}>
						<SelectInputUI
							type="single-select"
							options={appLocalizer.order_statuses}
							value={formData.shipped_status || ''}
							onChange={(val) => handleChange('shipped_status', val)}
							placeholder="Select status"
						/>
					</FormGroup>
				</FormGroupWrapper>
			</Column>
		</Container>
	);
};

export default ShipStation;