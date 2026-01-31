/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell } from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';

type StoreRow = {
	id?: number;
	store_name?: string;
	reason?: string;
	date?: string;
};

interface Props {
	onUpdated?: () => void;
}

const PendingDeactivateRequests: React.FC<Props> = ({ onUpdated }) => {
	const [data, setData] = useState<StoreRow[] | null>(null);

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [pageCount, setPageCount] = useState(0);

	// Fetch total rows on mount
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { count: true, deactivate: true },
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
	function requestData(rowsPerPage :number, currentPage :number) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				deactivate: true,
				page: currentPage,
				row: rowsPerPage,
			},
		})
			.then((response) => {
				setData(Array.isArray(response.data) ? response.data : []);
			})

			.catch(() => {
				setData([]);
			});
	}

	// Handle pagination and filter changes
	const requestApiForData = (rowsPerPage: number, currentPage: number) => {
		requestData(rowsPerPage, currentPage);
	};

	// Column definitions
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
			header: __('Store', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.store_name || ''}>
					{row.original.store_name || '-'}
				</TableCell>
			),
		},
		{
			header: __('Reason', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.reason || ''}>
					{row.original.reason || '-'}
				</TableCell>
			),
		},
		{
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.date || ''}>
					{row.original.date || '-'}
				</TableCell>
			),
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.status || ''}>
					<span
						className="admin-btn btn-purple"
						onClick={() => {
							handleSingleAction('approve', row);
						}}
					>
						<i className="adminfont-check"></i> {__('Approve', 'multivendorx')}
					</span>

					<span
						className="admin-btn btn-red"
						onClick={() => handleSingleAction('reject', row)}
					>
						<i className="adminfont-close"></i> {__('Reject', 'multivendorx')}
					</span>
				</TableCell>
			),
		},
	];

	const handleSingleAction = (action: string, row: any) => {
		let storeId = row.original.id;

		if (!storeId) {
			return;
		}

		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { deactivate: true, action, id: storeId },
		})
			.then(() => {
				requestData(pagination.pageSize, pagination.pageIndex + 1);
				onUpdated?.();
			})
			.catch(console.error);
	};

	return (
		<>
			<div className="admin-table-wrapper">
				<Table
					data={data}
					columns={columns as ColumnDef<Record<string, any>, any>[]}
					rowSelection={rowSelection}
					onRowSelectionChange={setRowSelection}
					defaultRowsPerPage={10}
					pageCount={pageCount}
					pagination={pagination}
					totalCounts={totalRows}
					onPaginationChange={setPagination}
					handlePagination={requestApiForData}
					perPageOption={[10, 25, 50]}
				/>
			</div>
		</>
	);
};

export default PendingDeactivateRequests;
