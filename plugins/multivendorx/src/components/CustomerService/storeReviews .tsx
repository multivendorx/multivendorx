/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	Table,
	TableCell,
	CommonPopup,
	getApiLink,
	ToggleSetting,
	MultiCalendarInput,
	AdminButton,
	FormGroupWrapper,
	FormGroup,
	TextArea,
	ProPopup,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { Dialog } from '@mui/material';

type Review = {
	review_id: number;
	store_id: number;
	customer_id: number;
	customer_name: string;
	order_id: number;
	overall_rating: number;
	review_title: string;
	review_content: string;
	status: string;
	reported: number;
	reply: string;
	reply_date: string;
	date_created: string;
	date_modified: string;
	review_images: string[];
	time_ago: string;
	store_name?: string;
};

type Status = {
	key: string;
	name: string;
	count: number;
};

type FilterData = {
	searchField: string;
	typeCount?: any;
	store?: string;
	rating?: string;
	orderBy?: any;
	order?: any;
};

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => React.ReactNode;
}

const StoreReviews: React.FC = () => {
	const [data, setData] = useState<Review[]>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pageCount, setPageCount] = useState<number>(0);
	const [status, setStatus] = useState<Status[] | null>(null);
	const [store, setStore] = useState<any[] | null>(null);
	const [selectedReview, setSelectedReview] = useState<Review | null>(null);
	const [replyText, setReplyText] = useState<string>('');

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [selectedRv, setSelectedRv] = useState<{
		id: number;
	} | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleDeleteClick = (rowData) => {
		setSelectedRv({
			id: rowData.review_id,
		});
		setConfirmOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedRv) {
			return;
		}

		try {
			await axios({
				method: 'DELETE',
				url: getApiLink(
					appLocalizer,
					`review/${selectedRv.id}`
				),
				headers: {
					'X-WP-Nonce':
						appLocalizer.nonce,
				},
			});

			requestData(
				pagination.pageSize,
				pagination.pageIndex + 1
			);
		} finally {
			setConfirmOpen(false);
			setSelectedRv(null);
		}
	};

	// Fetch total rows on mount
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((response) => {
				setStore(response.data.stores);
			})
			.catch(() => {
				setStore([]);
			});
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'review'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { count: true },
		})
			.then((response) => {
				setTotalRows(response.data || 0);
				setPageCount(Math.ceil(response.data / pagination.pageSize));
			})
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
		typeCount = '',
		store = '',
		rating = '',
		searchField = '',
		orderBy = '',
		order = '',
		startDate = new Date( new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date()
	) {
		setData([]);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'review'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				status: typeCount === 'all' ? '' : typeCount,
				store_id: store,
				overall_rating: rating,
				searchField,
				orderBy,
				order,
				startDate,
				endDate,
			},
		})
			.then((response) => {
				setData(response.data.items || []);
				const statuses = [
					{ key: 'all', name: 'All', count: response.data.all || 0 },
					{
						key: 'approved',
						name: 'Approved',
						count: response.data.approved || 0,
					},
					{
						key: 'pending',
						name: 'Pending',
						count: response.data.pending || 0,
					},
					{
						key: 'rejected',
						name: 'Rejected',
						count: response.data.rejected || 0,
					},
				];

				setStatus(statuses.filter((status) => status.count > 0));
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
		setData([]);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.typeCount,
			filterData?.store,
			filterData?.rating,
			filterData?.searchField,
			filterData?.orderBy,
			filterData?.order,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'store',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="   group-field">
					<select
						name="store"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">All Store</option>
						{store?.map((s: any) => (
							<option key={s.id} value={s.id}>
								{s.store_name.charAt(0).toUpperCase() +
									s.store_name.slice(1)}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'rating',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="   group-field">
					<select
						name="rating"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">
							{__('All ratings', 'multivendorx')}
						</option>
						<option value="5">
							{__('5 Stars & Up', 'multivendorx')}
						</option>
						<option value="4">
							{__('4 Stars & Up', 'multivendorx')}
						</option>
						<option value="3">
							{__('3 Stars & Up', 'multivendorx')}
						</option>
						<option value="2">
							{__('2 Stars & Up', 'multivendorx')}
						</option>
						<option value="1">
							{__('1 Star & Up', 'multivendorx')}
						</option>
					</select>
				</div>
			),
		},
		{
			name: 'date',
			render: (updateFilter) => (
				<div className="right">
					<MultiCalendarInput
						onChange={(range: any) =>
							updateFilter('date', {
								start_date: range.startDate,
								end_date: range.endDate,
							})
						}
					/>
				</div>
			),
		},
	];

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
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
			),
		},
	];

	// 🔹 Handle reply saving
	const handleSaveReply = async () => {
		if (!selectedReview) {
			return;
		}
		try {
			await axios
				.put(
					getApiLink(
						appLocalizer,
						`review/${selectedReview.review_id}`
					),
					{
						reply: replyText,
						status: selectedReview.status,
					},
					{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
				)
				.then(() => {
					requestData(pagination.pageSize, pagination.pageIndex + 1);
				});

			setData((prev) =>
				prev.map((r) =>
					r.review_id === selectedReview.review_id
						? {
							...r,
							reply: replyText,
							status: selectedReview.status,
						}
						: r
				)
			);

			setSelectedReview(null);
			setReplyText('');
		} catch {
			alert(__('Failed to save reply', 'multivendorx'));
		} finally {
			// setSaving(false);
		}
	};

	// 🔹 Table Columns
	const columns: ColumnDef<Review>[] = [
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
			id: 'customer',
			header: __('Customer', 'multivendorx'),
			cell: ({ row }) => {
				const { customer_id, customer_name } = row.original;
				const editLink = `${window.location.origin}/wp-admin/user-edit.php?user_id=${customer_id}`;

				return (
					<TableCell title={customer_name}>
						{customer_id ? (
							<a
								href={editLink}
								target="_blank"
								rel="noreferrer"
								className="customer-link"
							>
								{customer_name}
							</a>
						) : (
							'-'
						)}
					</TableCell>
				);
			},
		},
		{
			header: __('Store', 'multivendorx'),
			cell: ({ row }) => {
				const { store_id, store_name } = row.original;
				const baseUrl = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores`;
				const storeLink = store_id
					? `${baseUrl}&edit/${store_id}/&subtab=application-details`
					: '#';

				return (
					<TableCell title={store_name || ''}>
						{store_id ? (
							<a
								href={storeLink}
								target="_blank"
								rel="noopener noreferrer"
							>
								{store_name || '-'}
							</a>
						) : (
							store_name || '-'
						)}
					</TableCell>
				);
			},
		},
		{
			id: 'rating-details',
			header: __('Details', 'multivendorx'),
			cell: ({ row }) => {
				const rating = row.original.overall_rating ?? 0;
				const content = row.original.review_content || '';
				const shortText =
					content.length > 40
						? content.substring(0, 40) + '...'
						: content;
				return (
					<TableCell title={rating.toString()}>
						<div className="rating-details-wrapper">
							<div className="title-wrapper">
								<div className="rating-wrapper">
									{rating > 0 ? (
										<>
											{[...Array(Math.round(rating))].map(
												(_, i) => (
													<i
														key={`filled-${i}`}
														className="star-icon adminfont-star"
													></i>
												)
											)}
											{[
												...Array(
													5 - Math.round(rating)
												),
											].map((_, i) => (
												<i
													key={`empty-${i}`}
													className="star-icon adminfont-star-o"
												></i>
											))}
										</>
									) : (
										'-'
									)}
								</div>
								<div className="title">
									{row.original.review_title || '-'}
								</div>
							</div>

							<div className="review">{shortText || '-'}</div>
						</div>
					</TableCell>
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
			id: 'date_created',
			header: __('Date', 'multivendorx'),
			accessorFn: (row) =>
				row.date_created ? new Date(row.date_created).getTime() : 0, // numeric timestamp for sorting
			enableSorting: true,
			cell: ({ row }) => {
				const rawDate = row.original.date_created;
				const formattedDate = rawDate
					? new Intl.DateTimeFormat('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					}).format(new Date(rawDate))
					: '-';
				return (
					<TableCell title={formattedDate}>{formattedDate}</TableCell>
				);
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
								label: __('Reply / Edit', 'multivendorx'),
								icon: 'adminfont-edit',
								onClick: () => {
									setSelectedReview(row.original);
									setReplyText(row.original.reply || '');
								},
								hover: true,
							},
							{
								label: __('Delete', 'multivendorx'),
								icon: 'adminfont-delete delete',
								onClick: () => {
									handleDeleteClick(row.original);
								},
								hover: true,
							},
						],
					}}
				/>
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
					title="Delete Review"
					confirmMessage={
						selectedRv
							? `Are you sure you want to delete review?`
							: ''
					}
					confirmYesText="Delete"
					confirmNoText="Cancel"
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedRv(null);
					}}
				/>
			</Dialog>
			<Table
				data={data || []}
				columns={columns as ColumnDef<Record<string, any>, any>[]}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				defaultRowsPerPage={10}
				pageCount={pageCount}
				pagination={pagination}
				onPaginationChange={setPagination}
				handlePagination={requestApiForData}
				perPageOption={[10, 25, 50]}
				totalCounts={totalRows}
				typeCounts={status as Status[]}
				realtimeFilter={realtimeFilter}
			/>
			{selectedReview && (
				<CommonPopup
					open={!!selectedReview}
					onClose={() => setSelectedReview(null)}
					width="31.25rem"
					height="80%"
					header={{
						icon: 'store-review',
						title: `${__('Reply to Review', 'multivendorx')} – ${selectedReview?.store_name}`,
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
									onClick: () => setSelectedReview(null),
								},
								{
									icon: 'save',
									text: __('Save', 'multivendorx'),
									className: 'purple-bg',
									onClick: handleSaveReply,
								},
							]}
						/>
					}
				>
					<>
						<div className="review-popup-wrapper">
							<div className="customer-wrapper">
								<div className="avatar">
									{/* <i className="item-icon adminfont-person "></i> */}
									<span className="purple-bg">
										{selectedReview.customer_name
											.charAt(0)
											.toUpperCase()}
									</span>
								</div>
								{selectedReview && (
									<div className="name-wrapper">
										<div
											className="name"
											dangerouslySetInnerHTML={{
												__html: selectedReview.review_title,
											}}
										></div>

										<div className="rating-wrapper">
											{[...Array(Math.round(selectedReview.overall_rating || 0))].map(
												(_, i) => (
													<i
														key={`filled-${i}`}
														className="star-icon adminfont-star"
													></i>
												)
											)}

											{[
												...Array(
													5 - Math.round(selectedReview.overall_rating || 0)
												),
											].map((_, i) => (
												<i
													key={`empty-${i}`}
													className="star-icon adminfont-star-o"
												></i>
											))}

											<div className="date">
												{new Date(
													selectedReview.date_created
												).toLocaleDateString('en-GB', {
													day: '2-digit',
													month: 'short',
													year: 'numeric',
												})}
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="review">
								{selectedReview.review_content}
							</div>
						</div>

						<FormGroupWrapper>
							<FormGroup label={__('Respond to customer', 'multivendorx')} htmlFor="reply">
								<TextArea
									name="reply"
									value={replyText}
									onChange={(e) => setReplyText(e.target.value)}
									usePlainText={true}
								/>

							</FormGroup>

							<FormGroup label={__('Control if this review appears publicly, stays under moderation, or is excluded from the store page.', 'multivendorx')} htmlFor="control">
								<ToggleSetting
									wrapperclassName="setting-form-input"
									descclassName="settings-metabox-description"
									options={[
										{
											key: 'pending',
											value: 'Pending',
											label: __(
												'Pending',
												'multivendorx'
											),
										},
										{
											key: 'approved',
											value: 'Approved',
											label: __(
												'Approved',
												'multivendorx'
											),
										},
										{
											key: 'rejected',
											value: 'Rejected',
											label: __(
												'Rejected',
												'multivendorx'
											),
										},
									]}
									value={selectedReview.status}
									onChange={(val) => {
										setSelectedReview((prev) =>
											prev
												? { ...prev, status: val }
												: prev
										);
									}}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</>
				</CommonPopup>
			)}
		</>
	);
};

export default StoreReviews;
