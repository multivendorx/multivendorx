/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	AdminBreadcrumbs,
	TextAreaUI,
	Container,
	Column,
	FormGroupWrapper,
	FormGroup,
	TableCard,
	BasicInputUI,
	AdminButtonUI,
	ToggleSettingUI,
	SelectInputUI,
	PopupUI,
	NavigatorHeader,
} from 'zyra';
import './Announcements.scss';
import Popup from '../Popup/Popup';
import { formatLocalDate, truncateText } from '@/services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';


type AnnouncementForm = {
	title: string;
	url: string;
	content: string;
	stores: number[];
	status: 'draft' | 'pending' | 'publish';
};
interface Store {
	id: number;
	store_name: string;
}

interface StoreOption {
	value: string;
	label: string;
}

export const Announcements: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [submitting, setSubmitting] = useState(false);
	const [addAnnouncements, setAddAnnouncements] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);

	const [error, setError] = useState<string | null>(null);

	const [editId, setEditId] = useState<number | null>(null);

	// Form state
	const [formData, setFormData] = useState<AnnouncementForm>({
		title: '',
		url: '',
		content: '',
		stores: [],
		status: 'draft',
	});

	const fetchStoreOptions = () => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { filter_status: 'active' },
			})
			.then((response) => {
				const stores = response.data?.stores || [];

				const options: StoreOption[] = [
					{ value: 0, label: __('All Stores', 'multivendorx') },
					...stores.map((store: Store) => ({
						value: store.id,
						label: store.store_name,
					})),
				];

				setStoreOptions(options);
			})
			.catch(() => {
				setError(__('Failed to load stores', 'multivendorx'));
			});
	};


	const handleToggleChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			status: value as 'draft' | 'pending' | 'publish',
		}));
	};

	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);
	const [storeOptions, setStoreOptions] = useState<
		{ value: string; label: string }[]
	>([]);
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});
	const [selectedAn, setSelectedAn] = useState<{
		id: number;
	} | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleConfirmDelete = () => {
		if (!selectedAn) {
			return;
		}

		axios({
			method: 'DELETE',
			url: getApiLink(
				appLocalizer,
				`announcement/${selectedAn.id}`
			),
			headers: {
				'X-WP-Nonce': appLocalizer.nonce,
			},
		})
			.then(() => {
				fetchData({});
			})
			.finally(() => {
				setConfirmOpen(false);
				setSelectedAn(null);
			});
	};


	const validateForm = () => {
		const errors: { [key: string]: string } = {};

		if (!formData.title.trim()) {
			errors.title = __('Title is required', 'multivendorx');
		}

		if (!formData.content.trim()) {
			errors.content = __('Content is required', 'multivendorx');
		}

		if (!formData.stores || formData.stores.length === 0) {
			errors.stores = __(
				'Please select at least one store',
				'multivendorx'
			);
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleCloseForm = () => {
		setAddAnnouncements(false);
		setFormData({
			title: '',
			url: '',
			content: '',
			stores: [], // Reset to empty array
			status: 'draft',
		});
		setEditId(null);
		setError(null);
		setValidationErrors({});
	};

	// Handle form input change
	const handleChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear field error when user types
		if (validationErrors[name]) {
			setValidationErrors((prev) => {
				const updated = { ...prev };
				delete updated[name];
				return updated;
			});
		}
	};

	const handleBulkAction = (action: string, selectedIds: []) => {
		if (!selectedIds.length) {
			return;
		}

		if (!action) {
			return;
		}

		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, 'announcement'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { bulk: true, action, ids: selectedIds },
		})
			.then(() => {
				fetchData({});
			})
			.catch((err) => {
				setError(
					__(`Failed to perform bulk action${err}`, 'multivendorx')
				);
			});
	};

	const handleEdit = (id: number) => {
		axios.get(
			getApiLink(appLocalizer, `announcement/${id}`),
			{
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			}
		).then((response) => {
			fetchStoreOptions();
			setFormData({
				title: response.data.title || '',
				url: response.data.url || '',
				content: response.data.content || '',
				stores: response.data.stores ?? [],
				status: response.data.status || 'draft',
			});
			setEditId(id);
			setAddAnnouncements(true);
		})
	};

	const handleSubmit = () => {
		if (submitting) return;
		if (!validateForm()) return;

		setSubmitting(true);

		const endpoint = editId
			? getApiLink(appLocalizer, `announcement/${editId}`)
			: getApiLink(appLocalizer, 'announcement');

		const method = editId ? 'PUT' : 'POST';

		const payload = {
			...formData,
			stores: formData.stores,
		};

		axios({
			method,
			url: endpoint,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: payload,
		})
			.then((response) => {
				if (response.data?.success) {
					setAddAnnouncements(false);
					setFormData({
						title: '',
						url: '',
						content: '',
						stores: [],
						status: 'draft',
					});
					setEditId(null);
					fetchData({});
				} else {
					setError(__('Failed to save announcement', 'multivendorx'));
				}

				// cleanup on success
				setSubmitting(false);
			})
			.catch((err) => {
				setError(
					__(`Failed to save announcement${err}`, 'multivendorx')
				);

				// cleanup on error
				setSubmitting(false);
			});
	};

	const bulkActions = [
		{ label: 'Published', value: 'publish' },
		{ label: 'Pending', value: 'pending' },
		{ label: 'Delete', value: 'delete' },
	];

	const headers = [
		{ key: 'title', label: 'Title' },
		{ key: 'content', label: 'Content' },
		{ key: 'status', label: 'Status' },
		{ key: 'recipients', label: 'Recipients' },
		{ key: 'date', label: 'Date' },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (id: number) => handleEdit(id),
				},
				{
					label: __('Delete', 'multivendorx'),
					icon: 'delete',
					onClick: (id: number) => {
						setSelectedAn({ id: id });
						setConfirmOpen(true);
					},
					className: 'danger',
				},
			],
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'announcement'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce, withCredentials: true },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter || '',
					searchValue: query.searchValue || '',
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((ann: any) => ann?.id != null)
					.map((ann: any) => ann.id);

				setRowIds(ids);
				const mappedRows: any[][] = items.map((ann: any) => [
					{ display: ann.title, value: ann.id },
					{
						display: truncateText(ann.content || '', 50),
						value: ann.content || '',
					},
					{ display: ann.status, value: ann.status },
					{
						display: ann.store_name
							? ann.store_name.split(',').slice(0, 2).join(',') +
							(ann.store_name.split(',').length > 2 ? ', ...' : '')
							: 'All Stores',
						value: ann.store_name || '',
					},
					{ display: ann.date, value: ann.date },
				]);

				setRows(mappedRows);

				setCategoryCounts([
					{
						value: 'all',
						label: 'All',
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'publish',
						label: 'Published',
						count: Number(response.headers['x-wp-status-publish']) || 0,
					},
					{
						value: 'pending',
						label: 'Pending',
						count: Number(response.headers['x-wp-status-pending']) || 0,
					},
					{
						value: 'draft',
						label: 'Draft',
						count: Number(response.headers['x-wp-status-draft']) || 0,
					},
				]);

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch announcements', error);
				setError(__('Failed to load announcements', 'multivendorx'));
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};


	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		}
	];

	return (
		<>
			<PopupUI
				position="lightbox"
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				width={31.25}
				height="auto"
			>
				<Popup
					confirmMode
					title="Are you sure"
					confirmMessage={ selectedAn ? `` : '' }
					confirmYesText="Delete"
					confirmNoText="Cancel"
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedAn(null);
					}}
				/>
			</PopupUI>
			<NavigatorHeader
				headerIcon="adminfont-announcement"
				headerDescription={
					'Central hub for managing marketplace announcements. Review past updates and create new ones to keep stores informed.'
				}
				headerTitle="Announcements"
				buttons={[
					{
						label: __('Add New', 'multivendorx'),
						className: "admin-btn btn-purple-bg",
						iconClass: 'adminfont-plus',
						onClick: () => {
							setValidationErrors({});
							fetchStoreOptions();
							setAddAnnouncements(true);
						}
					}
				]}
			/>

			<PopupUI
				open={addAnnouncements}
				onClose={handleCloseForm}
				width={31.25}
				height="80%"
				header={{
					icon: 'announcement',
					title: editId
						? __('Edit Announcement', 'multivendorx')
						: __('Add Announcement', 'multivendorx'),
					description: __(
						'Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.',
						'multivendorx'
					),
				}}
				footer={
					<AdminButtonUI
						buttons={[
							{
								icon: 'close',
								text: __('Cancel', 'multivendorx'),
								color: 'red',
								onClick: handleCloseForm,
							},
							{
								icon: 'save',
								text: __('Save', 'multivendorx'),
								onClick: () => handleSubmit(),
							},
						]}
					/>
				}
			>
				<>
					<FormGroupWrapper>
						<FormGroup label={__('Title', 'multivendorx')} htmlFor="title">
							<BasicInputUI
								type="text"
								name="title"
								value={formData.title}
								onChange={(val) => handleChange('title', val as string)}
								msg={error}
							/>
							{validationErrors.title && (
								<div className="invalid-massage">
									{validationErrors.title}
								</div>
							)}
						</FormGroup>
						<FormGroup label={__('Announcement message', 'multivendorx')} htmlFor="content">
							<TextAreaUI
								name="content"
								value={formData.content}
								onChange={(val) => handleChange('content', val as string)}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer.settings_databases_value[
									'overview'
									]['tinymce_api_section'] ?? ''
								}
							/>

							{validationErrors.content && (
								<div className="invalid-massage">
									{validationErrors.content}
								</div>
							)}
						</FormGroup>
						<FormGroup label={__('Stores', 'multivendorx')} htmlFor="stores" >
							<SelectInputUI
								name="stores"
								type="multi-select"
								options={storeOptions}
								value={formData.stores.map((id) => id)}
								onChange={(newValue: StoreOption[]) => {
									if (!Array.isArray(newValue)) {
										return;
									}

									const selectedIds = newValue.map((opt) =>
										Number(opt.value)
									);
									const prevStores = formData.stores;

									let nextStores = selectedIds;

									if (
										!prevStores.includes(0) &&
										selectedIds.includes(0)
									) {
										nextStores = [0];
									} else if (
										prevStores.includes(0) &&
										selectedIds.length > 1
									) {
										nextStores = selectedIds.filter(
											(id) => id !== 0
										);
									}

									setValidationErrors((prev) => {
										const updated = { ...prev };
										delete updated.stores;
										return updated;
									});

									setFormData((prev) => ({
										...prev,
										stores: nextStores,
									}));
								}}
							/>

							{validationErrors.stores && (
								<div className="invalid-massage">
									{validationErrors.stores}
								</div>
							)}
						</FormGroup>
						<FormGroup label={__('Status', 'multivendorx')} desc={__('Select the status of the announcement.', 'multivendorx')} htmlFor="status">
							<ToggleSettingUI
								options={[
									{
										key: 'draft',
										value: 'draft',
										label: __('Draft', 'multivendorx'),
									},
									{
										key: 'pending',
										value: 'pending',
										label: __('Pending', 'multivendorx'),
									},
									{
										key: 'publish',
										value: 'publish',
										label: __('Published', 'multivendorx'),
									},
								]}
								value={formData.status}
								onChange={handleToggleChange}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</>
				{error && <p className="error-text">{error}</p>}
			</PopupUI >

			<Container general>
				<Column>
					<TableCard
						headers={headers}
						rows={rows}
						totalRows={totalRows}
						isLoading={isLoading}
						onQueryUpdate={fetchData}
						ids={rowIds}
						categoryCounts={categoryCounts}
						search={{}}
						filters={filters}
						bulkActions={bulkActions}
						onBulkActionApply={(action: string, selectedIds: []) => {
							handleBulkAction(action, selectedIds)
						}}
						format={appLocalizer.date_format}
					/>
				</Column>
			</Container>
		</>
	);
};

export default Announcements;