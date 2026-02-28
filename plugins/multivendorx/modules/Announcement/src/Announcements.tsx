/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
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
	TableRow,
	QueryProps,
	CategoryCount,
} from 'zyra';
import Popup from '../../../src/components/Popup/Popup';
import { formatLocalDate, truncateText } from '@/services/commonFunction';

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
				const stores = response.data || [];

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

	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
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
			url: getApiLink(appLocalizer, `announcement/${selectedAn.id}`),
			headers: {
				'X-WP-Nonce': appLocalizer.nonce,
			},
		})
			.then(() => {
				doRefreshTableData({});
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
	const handleChange = (name: string, value: string | []) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
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
				doRefreshTableData({});
			})
			.catch((err) => {
				setError(
					__(`Failed to perform bulk action${err}`, 'multivendorx')
				);
			});
	};

	const handleEdit = (id: number) => {
		axios
			.get(getApiLink(appLocalizer, `announcement/${id}`), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
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
			});
	};

	const handleSubmit = () => {
		if (submitting) {
			return;
		}
		if (!validateForm()) {
			return;
		}

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
					doRefreshTableData({});
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
		{ label: __('Published', 'multivendorx'), value: 'publish' },
		{ label: __('Pending', 'multivendorx'), value: 'pending' },
		{ label: __('Delete', 'multivendorx'), value: 'delete' },
	];

	const headers = {
		title: { label: __('Title', 'multivendorx') },
		content: { label: __('Content', 'multivendorx') },
		status_label: { label: __('Status', 'multivendorx'), type: 'status' },
		store_name: { label: __('Recipients', 'multivendorx') },
		date_created: { label: __('Date', 'multivendorx'), type: 'date' },
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (row) => handleEdit(row.id),
				},
				{
					label: __('Delete', 'multivendorx'),
					icon: 'delete',
					onClick: (row) => {
						setSelectedAn({ id: row.id });
						setConfirmOpen(true);
					},
					className: 'danger',
				},
			],
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'announcement'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
					withCredentials: true,
				},
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter || '',
					search_value: query.searchValue || '',
					start_date: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					end_date: query.filter?.created_at?.endDate
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
				setRows(items);

				setCategoryCounts([
					{
						value: 'all',
						label: __('All', 'multivendorx'),
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'publish',
						label: __('Published', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-publish']) || 0,
					},
					{
						value: 'pending',
						label: __('Pending', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-pending']) || 0,
					},
					{
						value: 'draft',
						label: __('Draft', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-draft']) || 0,
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
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
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
					title={__('Are you sure', 'multivendorx')}
					confirmMessage={selectedAn ? `` : ''}
					confirmYesText={__('Delete', 'multivendorx')}
					confirmNoText={__('Cancel', 'multivendorx')}
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedAn(null);
					}}
				/>
			</PopupUI>
			<NavigatorHeader
				headerIcon="announcement"
				headerDescription={__(
					'Central hub for managing marketplace announcements. Review past updates and create new ones to keep stores informed.',
					'multivendorx'
				)}
				headerTitle={__('Announcements', 'multivendorx')}
				buttons={[
					{
						label: __('Add New', 'multivendorx'),
						icon: 'plus',
						onClick: () => {
							setValidationErrors({});
							fetchStoreOptions();
							setAddAnnouncements(true);
						},
					},
				]}
			/>

			<PopupUI
				open={addAnnouncements}
				onClose={handleCloseForm}
				width={31.25}
				height={40}
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
				<FormGroupWrapper>
					<FormGroup
						label={__('Title', 'multivendorx')}
						htmlFor="title"
					>
						<BasicInputUI
							type="text"
							name="title"
							value={formData.title}
							onChange={(val) =>
								handleChange('title', val as string)
							}
							msg={{
								type: error,
								message: validationErrors.title,
							}}
						/>
					</FormGroup>
					<FormGroup
						label={__('Announcement message', 'multivendorx')}
						htmlFor="content"
					>
						<TextAreaUI
							name="content"
							value={formData.content}
							onChange={(val) =>
								handleChange('content', val as string)
							}
							usePlainText={false}
							tinymceApiKey={
								appLocalizer.settings_databases_value[
								'overview'
								]['tinymce_api_section'] ?? ''
							}
							msg={{
								type: error,
								message: validationErrors.content,
							}}
						/>
					</FormGroup>
					<FormGroup
						label={__('Stores', 'multivendorx')}
						htmlFor="stores"
					>
						<SelectInputUI
							name="stores"
							type="multi-select"
							options={storeOptions}
							value={formData.stores.map((id) => id)}
							onChange={(newValue) => {
								if (!Array.isArray(newValue)) {
									return;
								}

								const selectedIds = newValue.map((opt) =>
									Number(opt)
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
							msg={{
								type: error,
								message: validationErrors.stores,
							}}
						/>
					</FormGroup>
					<FormGroup
						label={__('Status', 'multivendorx')}
						desc={__(
							'Select the status of the announcement.',
							'multivendorx'
						)}
						htmlFor="status"
					>
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
							onChange={(val: string) =>
								handleChange('status', val)
							}
						/>
					</FormGroup>
				</FormGroupWrapper>
			</PopupUI>

			<Container general>
				<Column>
					<TableCard
						headers={headers}
						rows={rows}
						totalRows={totalRows}
						isLoading={isLoading}
						onQueryUpdate={doRefreshTableData}
						ids={rowIds}
						categoryCounts={categoryCounts}
						search={{}}
						filters={filters}
						bulkActions={bulkActions}
						onBulkActionApply={(
							action: string,
							selectedIds: []
						) => {
							handleBulkAction(action, selectedIds);
						}}
						format={appLocalizer.date_format}
					/>
				</Column>
			</Container>
		</>
	);
};

export default Announcements;
