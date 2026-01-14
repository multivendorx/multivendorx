/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, MultiCalendarInput } from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../services/commonFunction';

type StoreRow = {
	id?: number;
	store_name?: string;
	store_slug?: string;
	status?: string;
	email?: string;
	phone?: string;
	primary_owner?: any;
	applied_on?: string;
	store_image?: string;
	date?: string; // Add date field
};

type StoreStatus = {
	key: string;
	name: string;
	count: number;
};

type FilterData = {
	typeCount?: any;
	searchField?: any;
	orderBy?: any;
	order?: any;
};

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => ReactNode;
}

const StoreTable: React.FC = () => {
	const [data, setData] = useState<StoreRow[] | null>(null);
	const [storeStatus, setStoreStatus] = useState<StoreStatus[] | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [pageCount, setPageCount] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	// Fetch total rows on mount
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { count: true },
		})
			.then((response) => {
				setTotalRows(response.data || 0);
				setPageCount(Math.ceil(response.data / pagination.pageSize));
			})
			.catch(() => {});
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
		searchField = '',
		orderBy = '',
		order = '',
		startDate = new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		endDate = new Date()
	) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				filter_status: typeCount === 'all' ? '' : typeCount,
				searchField,
				orderBy,
				order,
				startDate,
				endDate,
			},
		})
			.then((response) => {
				setData(response.data.stores || []);

				const statuses = [
					{ key: 'all', name: 'All', count: response.data.all || 0 },
					{
						key: 'active',
						name: 'Active',
						count: response.data.active || 0,
					},
					{
						key: 'under_review',
						name: 'Under Review',
						count: response.data.under_review || 0,
					},
					{
						key: 'suspended',
						name: 'Suspended',
						count: response.data.suspended || 0,
					},
					{
						key: 'deactivated',
						name: 'Deactivated',
						count: response.data.deactivated || 0,
					},
				];

				// Only keep items where count > 0
				setStoreStatus(statuses.filter((status) => status.count > 0));
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
		setData(null);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.typeCount,
			filterData?.searchField,
			filterData?.orderBy,
			filterData?.order,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

	// Column definitions with sorting enabled
	const columns: ColumnDef<StoreRow>[] = [
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
			id: 'store_name',
			accessorKey: 'store_name',
			enableSorting: true,
			header: __('Store', 'multivendorx'),
			cell: ({ row }) => {
				const rawDate = row.original.applied_on;
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
					<TableCell title={row.original.store_name || ''}>
						<a
							onClick={() => {
								navigate(
									`?page=multivendorx#&tab=stores&edit/${row.original.id}`
								);
							}}
							className="product-wrapper"
						>
							{row.original.image ? (
								<img
									src={row.original.image}
									alt={row.original.store_name}
								/>
							) : (
								<i className="item-icon adminfont-store-inventory"></i>
							)}

							<div className="details">
								<span className="title">
									{row.original.store_name || '-'}
								</span>
								<span className="des">
									Since {formattedDate}
								</span>
							</div>
						</a>
					</TableCell>
				);
			},
		},
		{
			header: __('Contact', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.email || ''}>
					<div className="table-content">
						{row.original.email && (
							<div>
								<i className="adminfont-mail"></i>{' '}
								{row.original.email?.split('\n')[0].trim()}
							</div>
						)}
						{row.original.phone && (
							<div>
								<i className="adminfont-form-phone"></i>
								{row.original.phone ? row.original.phone : '-'}
							</div>
						)}
					</div>
				</TableCell>
			),
		},
		{
			header: __('Lifetime Earning', 'multivendorx'),
			cell: ({ row }: any) => (
				<TableCell
					title={row.original.commission.commission_total || ''}
				>
					{row.original.commission?.commission_total
						? formatCurrency(
								row.original.commission.commission_total
							)
						: '-'}
				</TableCell>
			),
		},
		{
			id: 'primary_owner',
			accessorKey: 'primary_owner',
			enableSorting: true,
			accessorFn: (row) =>
				row.primary_owner?.data.display_name ||
				row.primary_owner?.data.user_email ||
				'',
			header: __('Primary Owner', 'multivendorx'),
			cell: ({ row }) => {
				const primaryOwner = row.original.primary_owner;
				return (
					<TableCell
						title={
							primaryOwner?.data?.display_name ||
							primaryOwner?.data?.user_email ||
							''
						}
					>
						{primaryOwner ? (
							<a
								href={`${appLocalizer.admin_url}user-edit.php?user_id=${primaryOwner.ID}`}
								className="product-wrapper"
							>
								{row.original.primary_owner_image ? (
									<span
										dangerouslySetInnerHTML={{
											__html: row.original
												.primary_owner_image,
										}}
									/>
								) : (
									<i className="item-icon adminfont-person"></i>
								)}
								<div className="details">
									<div className="title">
										{primaryOwner.data?.display_name}
									</div>
									<div className="des">
										{primaryOwner.data?.user_email}
									</div>
								</div>
							</a>
						) : (
							<span>-</span>
						)}
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
			id: 'action',
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							{
								label: __('Settings', 'multivendorx'),
								icon: 'adminfont-setting',
								onClick: () => {
									navigate(
										`?page=multivendorx#&tab=stores&edit/${row.original.id}`
									);
								},
								hover: true,
							},
							...(row.original.status === 'active'
								? [
										{
											label: __(
												'Storefront',
												'multivendorx'
											),
											icon: 'adminfont-storefront',
											onClick: () => {
												if (!row.original.store_slug) {
													return;
												}
												window.open(
													`${appLocalizer.store_page_url}${row.original.store_slug}`,
													'_blank'
												);
											},
											hover: true,
										},
									]
								: []),
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

	return (
		<div className="general-wrapper">
			<div className="admin-table-wrapper">
				{error && <div className="error-notice">{error}</div>}
				<Table
					data={data}
					columns={columns as ColumnDef<Record<string, any>, any>[]}
					rowSelection={rowSelection}
					onRowSelectionChange={setRowSelection}
					defaultRowsPerPage={10}
					pageCount={pageCount}
					pagination={pagination}
					onPaginationChange={setPagination}
					handlePagination={requestApiForData}
					perPageOption={[10, 25, 50]}
					typeCounts={storeStatus as StoreStatus[]}
					totalCounts={totalRows}
					searchFilter={searchFilter}
					realtimeFilter={realtimeFilter}
				/>
			</div>
		</div>
	);
};

export default StoreTable;
