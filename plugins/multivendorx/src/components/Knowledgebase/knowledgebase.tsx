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
import '../Announcements/announcements.scss';
import { Dialog } from '@mui/material';

type KBRow = {
	date: any;
	id?: number;
	title?: string;
	content?: string;
	status?: 'publish' | 'pending' | string;
};

type KBForm = {
	title: string;
	content: string;
	status?: 'publish' | 'pending' | 'draft';
};

type AnnouncementStatus = {
	key: string;
	name: string;
	count: number;
};
type FilterData = {
	categoryFilter?: string;
	searchField?: string;
};
export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => ReactNode;
}

export const KnowledgeBase: React.FC = () => {
	const [submitting, setSubmitting] = useState(false);
	const [data, setData] = useState<KBRow[] | null>(null);
	const [addEntry, setAddEntry] = useState(false);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [announcementStatus, setAnnouncementStatus] = useState<
		AnnouncementStatus[] | null
	>(null);
	const [pageCount, setPageCount] = useState(0);
	const [editId, setEditId] = useState<number | null>(null);
	const [formData, setFormData] = useState<KBForm>({
		title: '',
		content: '',
		status: 'draft',
	});
	const bulkSelectRef = useRef<HTMLSelectElement>(null);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});
	const [selectedKb, setSelectedKb] = useState<{
		id: number;
	} | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleDeleteClick = (rowData) => {
		setSelectedKb({
			id: rowData.id,
		});
		setConfirmOpen(true);
	};
	const handleConfirmDelete = async () => {
		if (!selectedKb) {
			return;
		}

		try {
			await axios({
				method: 'DELETE',
				url: getApiLink(
					appLocalizer,
					`knowledge/${selectedKb.id}`
				),
				headers: {
					'X-WP-Nonce':
						appLocalizer.nonce,
				},
			});
			await fetchTotalRows();
			requestData(
				pagination.pageSize,
				pagination.pageIndex + 1
			);
		} finally {
			setConfirmOpen(false);
			setSelectedKb(null);
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

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleCloseForm = () => {
		setAddEntry(false);
		setFormData({ title: '', content: '', status: 'pending' }); // reset form
		setEditId(null); // reset edit mode
		setValidationErrors({});
	};
	// Handle input changes
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
				url: getApiLink(appLocalizer, 'knowledge'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: { bulk: true, action, ids: selectedIds },
			});
			await fetchTotalRows();
			requestData(pagination.pageSize, pagination.pageIndex + 1);
			setRowSelection({});
		} catch (err) {
			console.log(__('Failed to perform bulk action', 'multivendorx'));
		}
	};

	// Open edit modal
	const handleEdit = async (id: number) => {
		try {
			const response = await axios.get(
				getApiLink(appLocalizer, `knowledge/${id}`),
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);
			if (response.data) {
				setFormData({
					title: response.data.title || '',
					content: response.data.content || '',
					status: response.data.status || 'draft',
				});
				setEditId(id);
				setAddEntry(true);
			}
		} catch {
			console.log(__('Failed to load entry', 'multivendorx'));
		}
	};

	// Submit form
	const handleSubmit = async (status: 'publish' | 'pending' | 'draft') => {
		if (submitting) {
			return;
		}
		if (!validateForm()) {
			return; // Stop submission if errors exist
		}
		setSubmitting(true);

		try {
			const endpoint = editId
				? getApiLink(appLocalizer, `knowledge/${editId}`)
				: getApiLink(appLocalizer, 'knowledge');

			const method = editId ? 'PUT' : 'POST';
			const payload = { ...formData, status };

			const response = await axios({
				method,
				url: endpoint,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: payload,
			});

			if (response.data.success) {
				handleCloseForm();
				await fetchTotalRows();
				requestData(pagination.pageSize, pagination.pageIndex + 1);
			}
		} catch {
			console.log(__('Failed to save entry', 'multivendorx'));
		} finally {
			setSubmitting(false);
		}
	};

	const fetchTotalRows = async () => {
		try {
			const response = await axios.get(
				getApiLink(appLocalizer, 'knowledge'),
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: { count: true },
				}
			);
			const total = response.data || 0;
			setTotalRows(total);
			setPageCount(Math.ceil(total / pagination.pageSize));
		} catch {
			console.log(__('Failed to load total rows', 'multivendorx'));
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
		rowsPerPage = 10,
		currentPage = 1,
		categoryFilter = '',
		searchField = '',
		startDate = new Date( new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date()
	) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'knowledge'),
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

				// Only keep count > 0
				setAnnouncementStatus(statuses.filter((s) => s.count > 0));
			})
			.catch(() => {
				setData([]);
			});
	}

	// Handle pagination and filter changes
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
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

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'date',
			render: (updateFilter) => (
				<div className="right">
					<MultiCalendarInput
						onChange={(range: any) => {
							updateFilter('date', {
								start_date: range.startDate,
								end_date: range.endDate,
							});
						}}
					/>
				</div>
			),
		},
	];

	const truncateText = (text: string, maxLength: number) => {
		if (!text) {
			return '-';
		}
		return text.length > maxLength
			? text.slice(0, maxLength) + '...'
			: text;
	};
	// Columns
	const columns: ColumnDef<KBRow>[] = [
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
			header: __('Name your article', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.title || ''}>
					{truncateText(row.original.title || '', 30)}{' '}
					{/* truncate to 30 chars */}
				</TableCell>
			),
		},
		{
			header: __('Write your explanation or tutorial', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.content || ''}>
					{truncateText(row.original.content || '', 50)}{' '}
					{/* truncate to 50 chars */}
				</TableCell>
			),
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
			id: 'status',
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell type="status" status={row.original.status} />;
			},
		},
		{
			id: 'action',
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							{
								label: __('Edit', 'multivendorx'),
								icon: 'adminfont-edit',
								onClick: (rowData) => handleEdit(rowData.id),
								hover: true,
							},
							{
								label: __('Delete', 'multivendorx'),
								icon: 'adminfont-delete delete',
								onClick: (rowData: any) => {
									handleDeleteClick(rowData);
								},
								hover: true,
							},
						],
					}}
				/>
			),
		},
	];

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

	return (
		<>
			<Dialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
			>
				<ProPopup
					confirmMode
					title="Delete Knowledge Base"
					confirmMessage={
						selectedKb
							? `Are you sure you want to delete knowledge base?`
							: ''
					}
					confirmYesText="Delete"
					confirmNoText="Cancel"
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedKb(null);
					}}
				/>
			</Dialog>
			<AdminBreadcrumbs
				activeTabIcon="adminfont-book"
				tabTitle={__('Knowledge Base', 'multivendorx')}
				description={__(
					'Build your knowledge base: add new guides or manage existing ones in one place.',
					'multivendorx'
				)}
				buttons={[
					<div
						className="admin-btn btn-purple-bg"
						onClick={() => {
							setValidationErrors({});
							setAddEntry(true);
						}}
					>
						<i className="adminfont-plus"></i>
						{__('Add New', 'multivendorx')}
					</div>,
				]}
			/>

			{addEntry && (
				<CommonPopup
					open={addEntry}
					onClose={handleCloseForm}
					width="31.25rem"
					height="70%"
					header={{
						icon: 'book',
						title: editId
							? __('Edit Knowledgebase', 'multivendorx')
							: __('Add Knowledgebase', 'multivendorx'),
						description: __(
							'Write and publish a new knowledge base article to help stores navigate their dashboard.',
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
									onClick: () => handleSubmit(formData.status || 'draft'),
								},
							]}
						/>
					}
				>
					<>
						<FormGroupWrapper>
							<FormGroup label={__('Title', 'multivendorx')} htmlFor="Title">
								<BasicInput
									type="text"
									name="title"
									value={formData.title}
									onChange={handleChange}
								/>
								{validationErrors.title && (
									<p className="invalid-massage">
										{validationErrors.title}
									</p>
								)}
							</FormGroup>
							<FormGroup label={__('Content', 'multivendorx')} htmlFor="Content">
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
									<p className="invalid-massage">
										{validationErrors.content}
									</p>
								)}
							</FormGroup>
							<FormGroup label={__('Status', 'multivendorx')} htmlFor="status">
								<ToggleSetting
									value={formData.status}
									options={[
										{
											label: __('Draft', 'multivendorx'),
											value: 'draft',
										},
										{
											label: __(
												'Pending',
												'multivendorx'
											),
											value: 'pending',
										},
										{
											label: __(
												'Publish',
												'multivendorx'
											),
											value: 'publish',
										},
									]}
									onChange={(value) =>
										setFormData((prev) => ({
											...prev,
											status: value,
										}))
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</>
				</CommonPopup>
			)}
			<Container general>
				<Column>
					<Table
						data={data}
						columns={
							columns as ColumnDef<Record<string, any>, any>[]
						}
						rowSelection={rowSelection}
						onRowSelectionChange={setRowSelection}
						defaultRowsPerPage={10}
						pageCount={pageCount}
						pagination={pagination}
						onPaginationChange={setPagination}
						handlePagination={requestApiForData}
						perPageOption={[10, 25, 50]}
						categoryFilter={announcementStatus as AnnouncementStatus[]}
						bulkActionComp={() => <BulkAction />}
						totalCounts={totalRows}
						realtimeFilter={realtimeFilter}
						searchFilter={searchFilter}
					/>
				</Column>
			</Container>
		</>
	);
};

export default KnowledgeBase;
