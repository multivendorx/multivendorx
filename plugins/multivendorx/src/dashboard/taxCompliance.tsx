import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	Container,
	Column,
	Card,
	ItemListUI,
	FileInputUI,
	getApiLink,
	SelectInputUI,
	ButtonInputUI,
	PopupUI,
} from 'zyra';
import axios from 'axios';

const TaxCompliance = () => {

	const formatLabel = (str: string) =>
		str
			.replaceAll('_', ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());

	// ✅ Enabled sections from admin
	const taxComplianceConfig =
		appLocalizer.settings_databases_value['tax-compliance'] || {};

	const enabledSections = Object.keys(taxComplianceConfig);

	const [storeData, setStoreData] = useState<any>({});
	const [taxState, setTaxState] = useState<Record<string, any>>({});
	const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// ================= FETCH =================
	useEffect(() => {
		fetchStore();
	}, []);

	const fetchStore = async () => {
		const res = await axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		});

		console.log('STORE DATA:', res.data);
		setStoreData(res.data);
	};

	// ================= SYNC =================
	useEffect(() => {
		setTaxState(storeData?.tax_compliance || {});
	}, [storeData]);

	// ================= SAVE =================
	const autoSave = (updated: any) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				tax_compliance: updated,
			},
		}).then((res) => {
			console.log('Saved Tax Compliance', res.data);
		});
	};

	// ================= UPLOAD =================
	const handleUpload = (section: string, selected: any, fileData: any) => {
		if (!selected) return alert('Please select a document type');

		const documentUrl = fileData?.url;
		if (!documentUrl) return;

		const now = new Date().toISOString();

		// ✅ ALWAYS OVERWRITE (NO ARRAY)
		const updated = {
			...taxState,
			[section]: {
				type: selected.value,
				label: selected.label,
				document_url: documentUrl,
				status: 'under_review',
				created_at: taxState?.[section]?.created_at || now,
				updated_at: now,
			},
		};

		setTaxState(updated);
		autoSave(updated);
	};


	// ================= BADGE =================
	const getBadge = (status = 'pending') => {
		const map: any = {
			approved: 'green',
			under_review: 'blue',
			pending: 'yellow',
			rejected: 'red',
		};

		const format = (s: string) =>
			s.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

		return (
			<span className={`admin-badge ${map[status]}`}>
				{format(status)}
			</span>
		);
	};
	const getSectionStatus = (sectionKey: string) => {
		const item = taxState?.[sectionKey];

		if (!item) return 'pending';

		return item.status || 'pending';
	};

	// ================= ITEMS =================
	const getItems = (sectionKey: string) => {
		const item = taxState?.[sectionKey];

		if (!item) return [];

		return [
			{
				title: item.label,
				desc: (
					<span
						className="doc-link"
						style={{ cursor: 'pointer', color: '#6c5ce7' }}
						onClick={() => setPreviewUrl(item.document_url)}
					>
						{item.document_url?.split('/').pop() || ''}
					</span>
				),
				tags: (
					<>
						<ButtonInputUI
							buttons={{
								text: __('Replace Document', 'multivendorx'),
								color: 'purple',
								onClick: () => {
									if (!wp?.media) return;

									const frame = wp.media({
										title: 'Select or Upload File',
										button: { text: 'Use this file' },
										multiple: false,
									});

									frame.on('select', () => {
										const selected = frame
											.state()
											.get('selection')
											.toJSON();

										const file = selected?.[0];
										if (!file?.url) return;

										handleUpload(sectionKey, item, file);
									});

									frame.open();
								},
							}}
						/>
					</>
				),
			},
		];
	};

	// ================= SECTION CONFIG =================
	const SECTION_CONFIG: any = {
		bank_account_details: __('Bank Account Details', 'multivendorx'),
		tax_identification_documents: __('Tax Identification Documents', 'multivendorx'),
		business_registration: __('Business Registration', 'multivendorx'),
	};

	// ================= DROPDOWN =================
	const renderUploader = (sectionKey: string) => (
		<div style={{ marginBottom: '10px' }}>
			<SelectInputUI
				type="single-select"
				options={(taxComplianceConfig[sectionKey] || []).map((opt: string) => ({
					value: opt,
					label: formatLabel(opt),
				}))}
				value={selectedOptions[sectionKey]?.value || ''}
				onChange={(val: string) => {
					if (!val) return;

					setSelectedOptions((prev) => ({
						...prev,
						[sectionKey]: {
							value: val,
							label: formatLabel(val),
						},
					}));
				}}
				placeholder={__('Select document', 'multivendorx')}
				isClearable
			/>

			<ButtonInputUI
				buttons={{
					text: __('Upload Document', 'multivendorx'),
					color: 'purple',
					onClick: () => {
						if (!selectedOptions[sectionKey]) {
							alert('Please select a document type');
							return;
						}

						if (!wp?.media) return;

						const frame = wp.media({
							title: 'Select or Upload File',
							button: { text: 'Use this file' },
							multiple: false,
						});

						frame.on('select', () => {
							const selected = frame
								.state()
								.get('selection')
								.toJSON();

							const file = selected?.[0];
							if (!file?.url) return;

							handleUpload(sectionKey, selectedOptions[sectionKey], file);
						});

						frame.open();
					},
				}}
			/>
		</div>
	);

	return (
		<Container>
			<Column grid={6}>
				{/* LEFT */}
				{enabledSections.includes('bank_documents') && (
					<Card 
					title={SECTION_CONFIG.bank_account_details}
					action={getBadge(getSectionStatus('bank_documents'))}
					>
						{renderUploader('bank_documents')}

						<ItemListUI
							className="mini-card"
							border
							items={getItems('bank_documents')}
						/>
					</Card>
				)}

				{enabledSections.includes('business_documents') && (
					<Card 
					title={SECTION_CONFIG.business_registration}
					action={getBadge(getSectionStatus('business_documents'))}
					>
						{renderUploader('business_documents')}

						<ItemListUI
							className="mini-card"
							border
							items={getItems('business_documents')}
						/>
					</Card>
				)}
			</Column>

			<Column grid={6}>
				{/* RIGHT */}
				{enabledSections.includes('tax_documents') && (
					<Card 
					title={SECTION_CONFIG.tax_identification_documents}
					action={getBadge(getSectionStatus('tax_documents'))}
					>
						{renderUploader('tax_documents')}

						<ItemListUI
							className="mini-card"
							border
							items={getItems('tax_documents')}
						/>
					</Card>
				)}
			</Column>
			<PopupUI
				position="lightbox"
				open={!!previewUrl}
				onClose={() => setPreviewUrl(null)}
				width="80%"
				height="80%"
				header={{
					title: 'Document Preview',
				}}
			>
				{previewUrl && (
					previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
						<img
							src={previewUrl}
							alt="preview"
							style={{ width: '100%', height: 'auto' }}
						/>
					) : (
						<iframe
							src={previewUrl}
							title="Document"
							style={{ width: '100%', height: '100%' }}
						/>
					)
				)}
			</PopupUI>
		</Container>
	);
};

export default TaxCompliance;