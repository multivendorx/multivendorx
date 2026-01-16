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
	store_slug?: string;
	status?: string;
	withdraw_amount?: any;
};

interface Props {
	onUpdated?: () => void;
}

const PendingWithdrawal: React.FC<Props> = ({ onUpdated }) => {
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
			params: { count: true, pending_withdraw: true },
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
	function requestData(rowsPerPage :number, currentPage :number) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				pending_withdraw: true,
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
	const handleSingleAction = (action: string, row: any) => {
		let storeId = row.id;
		if (!storeId) {
			return;
		}

		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `transaction/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				withdraw: true,
				action,
				amount: row.withdraw_amount,
				store_id: row.id,
			},
		})
			.then(() => {
				requestData(pagination.pageSize, pagination.pageIndex + 1);
				onUpdated?.();
			})
			.catch(console.error);
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
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.status || ''}>
					{row.original.status || '-'}
				</TableCell>
			),
		},
		{
			header: __('Withdraw Amount', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.withdraw_amount || ''}>
					{row.original.withdraw_amount || '-'}
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
							handleSingleAction('approve', row.original);
						}}
					>
						<i className="adminfont-check"></i> Approve
					</span>

					<span
						className="admin-btn btn-red"
						onClick={() => handleSingleAction('reject', row.original)}
					>
						<i className="adminfont-close"></i> Reject
					</span>
				</TableCell>
			),
		},
	];

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
					onPaginationChange={setPagination}
					handlePagination={requestApiForData}
					perPageOption={[10, 25, 50]}
				/>
			</div>
		</>
	);
};

export default PendingWithdrawal;
