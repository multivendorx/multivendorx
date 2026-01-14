/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	Table,
	getApiLink,
	TableCell,
	MultiCalendarInput,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { formatCurrency } from '@/services/commonFunction';

type RefundRow = {
	id: number;
	orderNumber: string;
	customer: string;
	email: string;
	products: string;
	product_images: string[]; // Add product images array
	amount: string;
	reason: string;
	date: string;
	status: string;
	store_name: string;
};

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => React.ReactNode;
}

const Refund: React.FC = () => {
	const [data, setData] = useState<RefundRow[]>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [pageCount, setPageCount] = useState(0);
	const [totalRows, setTotalRows] = useState<number>(0);

	// Fetch store list and total refunds on mount
	useEffect(() => {

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'refund'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { count: true },
		})
			.then((response) => {
				const total = response.data || 0;
				setTotalRows(total);
				setPageCount(Math.ceil(total / pagination.pageSize));
			})
	}, []);

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
	}, []);


	// Fetch data from backend
	function requestData(
		rowsPerPage: number,
		currentPage: number,
		searchAction: string = 'order_id',
		searchField: string = '',
		store_id: string = '',
		orderBy: string = '',
		order: string = '',
		startDate: Date = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate: Date = new Date()
	) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'refund'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				searchField,
				searchAction,
				store_id,
				orderBy,
				order,
				startDate,
				endDate,
			},
		})
			.then((response) => {
				setData(response.data || []);
			})
			.catch(() => {
				setData([]);
			});
	}

	// Handle pagination & filter
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.searchAction,
			filterData?.searchField,
			filterData?.store_id,
			filterData?.orderBy,
			filterData?.order,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

	// Column definitions
	const columns: ColumnDef<RefundRow>[] = [
		{
			id: 'select',
			header: ({ table }: any) => (
				<input
					type="checkbox"
					checked={table.getIsAllRowsSelected()}
					onChange={table.getToggleAllRowsSelectedHandler()}
				/>
			),
			cell: ({ row }: any) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					onChange={row.getToggleSelectedHandler()}
				/>
			),
		},
		{
			id: 'order_id',
			accessorKey: 'order_id',
			enableSorting: true,
			header: __('Order', 'multivendorx'),
			cell: ({ row }: any) => {
				const orderId = row.original.order_id;
				const orderLink = `/dashboard/sales/orders/#view/${orderId}`;

				return (
					<TableCell title={orderId ? `#${orderId}` : '-'}>
						{orderId ? <a href={orderLink}>#{orderId}</a> : '-'}
					</TableCell>
				);
			},
		},
		{
			header: __('Customer', 'multivendorx'),
			cell: ({ row }: any) => {
				const name = row.original.customer_name?.trim();
				return <TableCell title={name || '-'}>{name || '-'}</TableCell>;
			},
		},
		{
			header: __('Refund Amount', 'multivendorx'),
			cell: ({ row }: any) => (
				<TableCell title={row.original.amount || ''}>
					{formatCurrency(row.original.amount)}
				</TableCell>
			),
		},
		{
			header: __('Refund Reason', 'multivendorx'),
			cell: ({ row }: any) => (
				<TableCell title={row.original.customer_reason || ''}>
					{row.original.customer_reason || '-'}
				</TableCell>
			),
		},
		{
			id: 'status',
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell type="status" status={row.original.status} />;
			},
		},
		{
			id: 'date',
			accessorKey: 'date',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }: any) => {
				const date = row.original.date;
				if (!date) {
					return <TableCell>-</TableCell>;
				}

				const formattedDate = new Date(date).toLocaleDateString(
					'en-US',
					{
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					}
				);

				return (
					<TableCell title={formattedDate}>{formattedDate}</TableCell>
				);
			},
		},
	];

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchAction',
			render: (updateFilter, filterValue) => (
				<div className="search-action">
					<select
						value={filterValue || ''}
						onChange={(e) =>
							updateFilter('searchAction', e.target.value || '')
						}
					>
						<option value="order_id">
							{__('Order Id', 'multivendorx')}
						</option>
						<option value="customer">
							{__('Customer', 'multivendorx')}
						</option>
					</select>
				</div>
			),
		},
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<div className="search-section">
					<input
						name="searchField"
						type="text"
						placeholder={__('Search', 'multivendorx')}
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
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
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">{__('Refund', 'multivendorx')}</div>
					<div className="des">
						{__(
							'Manage and process refund requests from customers.',
							'multivendorx'
						)}
					</div>
				</div>
			</div>
			<Table
				data={data}
				columns={columns as any}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				defaultRowsPerPage={10}
				pageCount={pageCount}
				pagination={pagination}
				searchFilter={searchFilter}
				onPaginationChange={setPagination}
				realtimeFilter={realtimeFilter}
				handlePagination={requestApiForData}
				perPageOption={[10, 25, 50]}
				totalCounts={totalRows}
			/>
		</>
	);
};

export default Refund;
