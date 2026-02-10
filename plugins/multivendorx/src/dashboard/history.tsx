import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import {   MultiCheckBox, Table, TableCell, TextArea } from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';

type History = {
	id: number;
	store_name?: string; // Coupon Name
	store_slug?: string; // Reused but we'll map different fields into it
	type?: string; // Coupon Type
	amount?: string; // Coupon Amount
	usage?: string; // Usage / Limit
	expiry?: string; // Expiry Date
	status?: string;
};

const History: React.FC = () => {
	const [data, setData] = useState<CommissionRow[]>([]);

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const [showDropdown, setShowDropdown] = useState(false);

	const toggleDropdown = (id: any) => {
		if (showDropdown === id) {
			setShowDropdown(false);
			return;
		}
		setShowDropdown(id);
	};
	const [pageCount, setPageCount] = useState(0);

	// 🔹 Add demo data on mount
	useEffect(() => {
		const demoData: CommissionRow[] = [
			{
				id: 25831,
				store_name: 'EAA2US8Z',
				type: 'Fixed Cart Discount',
				amount: '10.6',
				usage: '0 / 200',
				expiry: '2025-12-31',
				status: 'Active',
			},
			{
				id: 25832,
				store_name: 'WELCOME10',
				type: 'Percentage',
				amount: '10%',
				usage: '12 / 100',
				expiry: '2026-01-15',
				status: 'Active',
			},
			{
				id: 25833,
				store_name: 'FREESHIP',
				type: 'Free Shipping',
				amount: '—',
				usage: '5 / ∞',
				expiry: '2025-10-01',
				status: 'Expired',
			},
		];
		setData(demoData);
		setTotalRows(demoData.length);
	}, []);

	// 🔹 Update page count when pagination or totalRows changes
	useEffect(() => {
		const rowsPerPage = pagination.pageSize;
		setPageCount(Math.ceil(totalRows / rowsPerPage));
	}, [pagination, totalRows]);

	// Column definitions
	const columns: ColumnDef<CommissionRow>[] = [
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
			header: __('Commission', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.store_name || ''}>
					{row.original.store_name || '-'}
				</TableCell>
			),
		},
		{
			header: __('Commission type', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.type || ''}>
					{row.original.type || '-'}
				</TableCell>
			),
		},
		{
			header: __('Commission Amount', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.amount || ''}>
					{row.original.amount || '-'}
				</TableCell>
			),
		},
		{
			header: __('Usage / Limit', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.usage || ''}>
					{row.original.usage || '-'}
				</TableCell>
			),
		},
		{
			header: __('Expiry Date', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.expiry || ''}>
					{row.original.expiry || '-'}
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
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title="Action">
					<div className="action-section">
						<div className="action-icons">
							<i
								className="adminfont-more-vertical"
								onClick={() =>
									toggleDropdown(row.original.order_id)
								}
							></i>
							<div
								className={`action-dropdown ${
									showDropdown === row.original.order_id
										? 'show'
										: ''
								}`}
							>
								<ul>
									<li
										onClick={() =>
											(window.location.href = `?page=multivendorx#&tab=stores&view&id=${row.original.id}`)
										}
									>
										<i className="adminfont-preview"></i>
										{__('View Store', 'multivendorx')}
									</li>
									<li
										onClick={() =>
											(window.location.href = `?page=multivendorx#&tab=stores&edit/${row.original.id}`)
										}
									>
										<i className="adminfont-edit"></i>
										{__('Edit Store', 'multivendorx')}
									</li>
								</ul>
							</div>
						</div>
					</div>
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
					perPageOption={[10, 25, 50]}
					typeCounts={[]}
					// realtimeFilter={[]}
				/>
			</div>
		</>
	);
};

export default History;
