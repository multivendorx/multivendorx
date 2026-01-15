/* global appLocalizer */
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	Table,
	getApiLink,
	TableCell,
	AdminBreadcrumbs,
	BasicInput,
	TextArea,
	CommonPopup,
	SelectInput,
	ToggleSetting,
	MultiCalendarInput,
	Container,
	Column,
	FormGroupWrapper,
	FormGroup,
	AdminButton,
	ProPopup,
} from 'zyra';

import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import './announcements.scss';
import { truncateText } from '@/services/commonFunction';
import { Dialog } from '@mui/material';

type AnnouncementRow = {
	stores: number[] | null;
	date: string;
	title: string;
	content: string;
	id?: number;
	store_name?: string;
	store_slug?: string;
	status?: 'publish' | 'pending' | string;
};
type AnnouncementStatus = {
	key: string;
	name: string;
	count: number;
};

type FilterData = {
	searchField: string;
	categoryFilter?: string;
	date?: FilterDate;
};

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

interface DateRange {
	startDate: Date;
	endDate: Date;
}

interface FilterDate {
	start_date?: Date;
	end_date?: Date;
}

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: unknown) => void,
		filterValue: unknown
	) => ReactNode;
}

export const Announcements: React.FC = () => {
	const [submitting, setSubmitting] = useState(false);
	const [data, setData] = useState<AnnouncementRow[] | null>(null);
	const [addAnnouncements, setAddAnnouncements] = useState(false);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const [dateFilter, setDateFilter] = useState<FilterDate>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});

	const [pageCount, setPageCount] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const bulkSelectRef = useRef<HTMLSelectElement>(null);

	const [editId, setEditId] = useState<number | null>(null);

	// Form state
	const [formData, setFormData] = useState<AnnouncementForm>({
		title: '',
		url: '',
		content: '',
		stores: [],
		status: 'draft',
	});

	const fetchStoreOptions = async () => {
		try {
			const response = await axios.get(
				getApiLink(appLocalizer, 'store'),
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: { filter_status: 'active' },
				}
			);
			const stores = response.data?.stores || [];
			const options: StoreOption[] = [
				{ value: 0, label: __('All Stores', 'multivendorx') },
				...stores.map((store: Store) => ({
					value: store.id,
					label: store.store_name,
				})),
			];
			setStoreOptions(options);
		} catch {
			setError(__('Failed to load stores', 'multivendorx'));
		}
	};

	const handleToggleChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			status: value as 'draft' | 'pending' | 'publish',
		}));
	};

	const [announcementStatus, setAnnouncementStatus] = useState<
		AnnouncementStatus[] | null
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

	const handleDeleteClick = (rowData) => {
		setSelectedAn({
			id: rowData.id,
		});
		setConfirmOpen(true);
	};
	const handleConfirmDelete = async () => {
		if (!selectedAn) {
			return;
		}

		try {
			await axios({
				method: 'DELETE',
				url: getApiLink(
					appLocalizer,
					`announcement/${selectedAn.id}`
				),
				headers: {
					'X-WP-Nonce':
						appLocalizer.nonce,
				},
			});

			// Refresh data after deletion
			await fetchTotalRows();
			requestData(
				pagination.pageSize,
				pagination.pageIndex + 1,
				'',
				''
			);
		} finally {
			setConfirmOpen(false);
			setSelectedAn(null);
		}
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
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
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

	const handleBulkAction = async () => {
		const action = bulkSelectRef.current?.value;
		const selectedIds = Object.keys(rowSelection)
			.map((key) => {
				const index = Number(key);
				return data && data[index] ? data[index].id : null;
			})
			.filter((id): id is number => id !== null);

		if (!selectedIds.length) {
			return;
		}

		if (!action) {
			return;
		}

		setData(null);

		try {
			await axios({
				method: 'PUT',
				url: getApiLink(appLocalizer, 'announcement'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: { bulk: true, action, ids: selectedIds },
			});
			await fetchTotalRows();
			requestData(pagination.pageSize, pagination.pageIndex + 1);
			setRowSelection({});
		} catch (err: unknown) {
			setError(__(`Failed to perform bulk action${err}`, 'multivendorx'));
		}
	};

	const handleEdit = async (id: number) => {
		try {
			const response = await axios.get(
				getApiLink(appLocalizer, `announcement/${id}`),
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);

			if (response.data) {
				await fetchStoreOptions();

				setFormData({
					title: response.data.title || '',
					url: response.data.url || '',
					content: response.data.content || '',
					stores: response.data.stores ?? [],
					status: response.data.status || 'draft',
				});

				setEditId(id);
				setAddAnnouncements(true);
			}
		} catch (err: unknown) {
			setError(__(`Failed to load announcement${err}`, 'multivendorx'));
		}
	};

	const handleSubmit = async () => {
		if (submitting) {
			return;
		}

		if (!validateForm()) {
			return; // Stop submission if errors exist
		}

		setSubmitting(true);
		try {
			const endpoint = editId
				? getApiLink(appLocalizer, `announcement/${editId}`)
				: getApiLink(appLocalizer, 'announcement');
			const method = editId ? 'PUT' : 'POST';

			const payload = {
				...formData,
				stores: formData.stores, // already an array of numbers
			};

			const response = await axios({
				method,
				url: endpoint,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: payload,
			});

			if (response.data.success) {
				setAddAnnouncements(false);
				setFormData({
					title: '',
					url: '',
					content: '',
					stores: [],
					status: 'draft',
				});
				setEditId(null);
				await fetchTotalRows();
				requestData(pagination.pageSize, pagination.pageIndex + 1);
			} else {
				setError(__('Failed to save announcement', 'multivendorx'));
			}
		} catch (err: unknown) {
			setError(__(`Failed to save announcement${err}`, 'multivendorx'));
		} finally {
			setSubmitting(false);
		}
	};

	const fetchTotalRows = async () => {
		try {
			const response = await axios.get(
				getApiLink(appLocalizer, 'announcement'),
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: { count: true },
				}
			);
			const total = response.data || 0;
			setTotalRows(total);
			setPageCount(Math.ceil(total / pagination.pageSize));
		} catch {
			setError(__('Failed to load total rows', 'multivendorx'));
		}
	};

	// Fetch total rows on mount
	useEffect(() => {
		fetchTotalRows();
	}, []);

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
		setPageCount(Math.ceil(totalRows / rowsPerPage));
	}, [pagination]);

	// Fetch data from backend.
	function requestData(
		rowsPerPage :number,
		currentPage :number,
		categoryFilter = '',
		searchField = '',
		startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date()
	) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'announcement'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				status: categoryFilter === 'all' ? '' : categoryFilter,
				startDate,
				endDate,
				searchField,
			},
		})
			.then((response) => {
				setData(response.data.items || []);
				const statuses = [
					{ key: 'all', name: 'All', count: response.data.all || 0 },
					{
						key: 'publish',
						name: 'Published',
						count: response.data.publish || 0,
					},
					{
						key: 'pending',
						name: 'Pending',
						count: response.data.pending || 0,
					},
					{
						key: 'draft',
						name: 'Draft',
						count: response.data.draft || 0,
					},
				];

				// Remove items where count === 0
				setAnnouncementStatus(
					statuses.filter((status) => status.count > 0)
				);
			})
			.catch(() => {
				setError(__('Failed to load stores', 'multivendorx'));
				setData([]);
			});
	}

	// Handle pagination and filter changes
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		const selectedStatus = announcementStatus?.find(
			(status) => status.key === filterData?.categoryFilter
		);

		setTotalRows(selectedStatus ? selectedStatus.count : announcementStatus?.find(s => s.key === 'all')?.count || 0);

		setData(null);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.categoryFilter,
			filterData?.searchField,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<>
					<div className="search-section">
						<input
							name="searchField"
							type="text"
							placeholder={__('Search', 'multivendorx')}
							onChange={(e) => {
								updateFilter(e.target.name, e.target.value);
							}}
							value={filterValue || ''}
						/>
						<i className="adminfont-search"></i>
					</div>
				</>
			),
		},
	];

	// Columns
	const columns: ColumnDef<AnnouncementRow>[] = [
		{
			id: 'select',
			header: ({ table }) => (
				<input
					type="checkbox"
					checked={table.getIsAllRowsSelected()}
					onChange={table.getToggleAllRowsSelectedHandler()}
				/>
			),
			cell: ({ row }) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					onChange={row.getToggleSelectedHandler()}
				/>
			),
		},
		{
			header: __('Title', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.title || ''}>
					{truncateText(row.original.title || '', 30)}{' '}
				</TableCell>
			),
		},
		{
			header: __('Content', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.content || ''}>
					{truncateText(row.original.content || '', 50)}{' '}
					{/* truncate to 50 chars */}
				</TableCell>
			),
		},
		{
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				return (
					<TableCell
						title={'status'}
						type="status"
						status={row.original.status}
						children={undefined}
					/>
				);
			},
		},
		{
			header: __('Recipients', 'multivendorx'),
			cell: ({ row }) => {
				const storeString = row.original.store_name;

				// 🔹 If store_name is empty, null, or undefined → show All Stores
				if (!storeString) {
					return (
						<TableCell title={'stores'}>
							{__('All Stores', 'multivendorx')}
						</TableCell>
					);
				}

				// 🔹 Otherwise, split and format store names
				const stores = storeString.split(',').map((s) => s.trim());
				let displayStores = stores;

				if (stores.length > 2) {
					displayStores = [...stores.slice(0, 2), '...'];
				}

				return (
					<TableCell title={stores.join(', ')}>
						{displayStores.join(', ')}
					</TableCell>
				);
			},
		},
		{
			id: 'date',
			accessorKey: 'date',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => {
				const rawDate = row.original.date;
				let formattedDate = '-';
				if (rawDate) {
					const dateObj = new Date(rawDate);
					formattedDate = new Intl.DateTimeFormat('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					}).format(dateObj);
				}
				return (
					<TableCell title={formattedDate}>{formattedDate}</TableCell>
				);
			},
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					title={'action'}
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							{
								label: __('Edit', 'multivendorx'),
								icon: 'adminfont-edit',
								onClick: (rowData: AnnouncementRow) => {
									handleEdit(rowData.id);
								},
							},
							{
								label: __('Delete', 'multivendorx'),
								icon: 'adminfont-delete delete',
								onClick: (rowData: AnnouncementRow) => {
									handleDeleteClick(rowData);
								},
							},
						],
					}}
				/>
			),
		},
	];

	const BulkAction: React.FC = () => (
		<div className="action">
			<i className="adminfont-form"></i>
			<select
				name="action"
				ref={bulkSelectRef}
				onChange={handleBulkAction}
			>
				<option value="">{__('Bulk actions')}</option>
				<option value="publish">{__('Publish', 'multivendorx')}</option>
				<option value="pending">{__('Pending', 'multivendorx')}</option>
				<option value="delete">{__('Delete', 'multivendorx')}</option>
			</select>
		</div>
	);

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'date',
			render: (updateFilter) => (
				<div className="right">
					<MultiCalendarInput
						value={{
							startDate: dateFilter.start_date!,
							endDate: dateFilter.end_date!,
						}}
						onChange={(range: DateRange) => {
							const next = {
								start_date: range.startDate,
								end_date: range.endDate,
							};

							setDateFilter(next);
							updateFilter('date', next);
						}}
					/>
				</div>
			),
		},
	];


	return (
		<>
			<Dialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
			>
				<ProPopup
					confirmMode
					title="Are you sure"
					confirmMessage={
						selectedAn
							? `Are you sure you want to delete Announcement?`
							: ''
					}
					confirmYesText="Delete"
					confirmNoText="Cancel"
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedAn(null);
					}}
				/>
			</Dialog>
			<AdminBreadcrumbs
				activeTabIcon="adminfont-announcement"
				description={
					'Central hub for managing marketplace announcements. Review past updates and create new ones to keep stores informed.'
				}
				tabTitle="Announcements"
				buttons={[
					<div
						className="admin-btn btn-purple-bg"
						onClick={async () => {
							setValidationErrors({});
							await fetchStoreOptions();
							setAddAnnouncements(true);
						}}
					>
						<i className="adminfont-plus"></i>
						{__('Add New', 'multivendorx')}
					</div>,
				]}
			/>

			<CommonPopup
				open={addAnnouncements}
				onClose={handleCloseForm}
				width="31.25rem"
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
					<AdminButton
						buttons={[
							{
								icon: 'close',
								text: __('Cancel', 'multivendorx'),
								className: 'red',
								onClick: handleCloseForm,
							},
							{
								icon: 'save',
								text: __('Save', 'multivendorx'),
								className: 'purple-bg',
								onClick: () => handleSubmit(),
							},
						]}
					/>
				}
			>
				<>
					<FormGroupWrapper>
						<FormGroup label={__('Title', 'multivendorx')} htmlFor="title">
							<BasicInput
								type="text"
								name="title"
								value={formData.title}
								onChange={handleChange}
								msg={error}
							/>
							{validationErrors.title && (
								<div className="invalid-massage">
									{validationErrors.title}
								</div>
							)}
						</FormGroup>
						<FormGroup label={__('Announcement message', 'multivendorx')} htmlFor="content">
							<TextArea
								name="content"
								value={formData.content}
								onChange={handleChange}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer.settings_databases_value[
									'marketplace'
									]['tinymce_api_section'] ?? ''
								}
							/>

							{validationErrors.content && (
								<div className="invalid-massage">
									{validationErrors.content}
								</div>
							)}
						</FormGroup>
						<FormGroup label={__('Stores', 'multivendorx')} htmlFor="stores">
							<SelectInput
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
						<FormGroup label={__('Status', 'multivendorx')} htmlFor="status">
							<ToggleSetting

								descClass="settings-metabox-description"
								description={__(
									'Select the status of the announcement.',
									'multivendorx'
								)}
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
										label: __('Publish', 'multivendorx'),
									},
								]}
								value={formData.status}
								onChange={handleToggleChange}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</>
				{error && <p className="error-text">{error}</p>}
			</CommonPopup>

			<Container general>
				<Column>
					<Table
						data={data}
						columns={
							columns as ColumnDef<AnnouncementRow, unknown>[]
						}
						rowSelection={rowSelection}
						onRowSelectionChange={setRowSelection}
						defaultRowsPerPage={10}
						searchFilter={searchFilter}
						pageCount={pageCount}
						pagination={pagination}
						onPaginationChange={setPagination}
						handlePagination={requestApiForData}
						perPageOption={[10, 25, 50]}
						categoryFilter={
							announcementStatus as AnnouncementStatus[]
						}
						bulkActionComp={() => <BulkAction />}
						totalCounts={totalRows}
						realtimeFilter={realtimeFilter}
					/>
				</Column>
			</Container>
		</>
	);
};

export default Announcements;
