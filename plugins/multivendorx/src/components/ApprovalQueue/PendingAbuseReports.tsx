/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, MultiCalendarInput, ProPopup, Container, Column } from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { Dialog } from '@mui/material';
import { formatLocalDate, formatWcShortDate } from '@/services/commonFunction';

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => React.ReactNode;
}

type ReportRow = {
	ID: number;
	store_id: number;
	store_name?: string;
	product_id: number;
	product_name?: string;
	product_link?: string;
	name: string;
	email: string;
	reason?: string;
	message?: string;
	created_at: string;
	updated_at: string;
};

interface Props {
	onUpdated?: () => void;
}
type FilterData = {
	searchAction?: string;
	searchField?: string;
	typeCount?: any;
	store?: string;
	order?: any;
	orderBy?: any;
	date?: {
		start_date: Date;
		end_date: Date;
	};
	transactionType?: string;
	transactionStatus?: string;
};
const PendingReportAbuse: React.FC<Props> = ({ onUpdated }) => {
	const [data, setData] = useState<ReportRow[] | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [pageCount, setPageCount] = useState(0);
	const [store, setStore] = useState<any[] | null>(null);
	const [dateFilter, setDateFilter] = useState<FilterDate>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});

	// delete popup
	const handleDeleteClick = (rowData: ReportRow) => {
		setSelectedReport(rowData);
		setConfirmOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedReport) return;

		try {
			await axios.delete(
				getApiLink(appLocalizer, `report-abuse/${selectedReport.ID}`),
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);

			requestData(
				pagination.pageSize,
				pagination.pageIndex + 1
			);

			onUpdated?.();
		} catch {
			alert(__('Failed to delete report', 'multivendorx'));
		} finally {
			setConfirmOpen(false);
			setSelectedReport(null);
		}
	};

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
	}, []);

	// Fetch total count on mount
	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'report-abuse'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { count: true },
			})
			.then((res) => {
				const total = res.data || 0;
				setTotalRows(total);
				setPageCount(Math.ceil(total / pagination.pageSize));
			})
			.catch(() => {
				console.error('Failed to load total rows');
			});
	}, []);

	const columns: ColumnDef<ReportRow>[] = [
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
			header: __('Product', 'multivendorx'),
			cell: ({ row }) => {
				const product = row.original;
				const image = product.product_image; // fallback to default
				const productName = product.product_name || '-';
				const productId = product.product_id; // use ID for admin edit link
				const productLink = `${window.location.origin}/wp-admin/post.php?post=${productId}&action=edit`;
				const sku = product.product_sku || '';
				const storeName = product.store_name;
				const storeLink = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${product.store_id}`;

				return (
					<TableCell title={`${productName} - ${storeName}`}>
						<a
							href={productLink}
							target="_blank"
							rel="noreferrer"
							className="product-wrapper"
						>
							{image ? (
								<img src={image} alt={productName} />
							) : (
								<i className="item-icon adminfont-multi-product"></i>
							)}
							<div className="details">
								<span className="title">{productName}</span>
								{sku && (
									<span className="des">
										SKU: {sku}
										{storeName !== '' && (
											<>
												| By:
												<a
													href={storeLink}
													target="_blank"
													rel="noreferrer"
													className="link-item"
												>
													{storeName}
												</a>
											</>
										)}
									</span>
								)}
							</div>
						</a>
					</TableCell>
				);
			},
		},

		{
			header: __('Reported By', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					title={`Reported By: ${row.original.name} (${row.original.email})`}
				>
					{row.original.name
						? `${row.original.name} (${row.original.email})`
						: '-'}
				</TableCell>
			),
		},
		{
			header: __('Reason', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.reason || '-'}>
					{row.original.reason ?? '-'}
				</TableCell>
			),
		},
		{
			id: 'created_at',
			accessorKey: 'created_at',
			enableSorting: true,
			header: __('Date created', 'multivendorx'),
			cell: ({ row }) => {
				return (
					<TableCell title={''}>{formatWcShortDate(row.original.created_at)}</TableCell>
				);
			},
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							{
								label: __('Delete', 'multivendorx'),
								icon: 'adminfont-delete',
								onClick: (rowData: ReportRow) => {
									handleDeleteClick(rowData);
								},
							},
						],
					}}
				/>
			),
		},
	];

	// 🔹 Fetch data from backend
	function requestData(
		rowsPerPage: number,
		currentPage: number,
		store = '',
		orderBy = '',
		order = '',
		startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date()
	) {
		setData(null);

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'report-abuse'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				store_id: store,
				startDate: startDate ? formatLocalDate(startDate) : '',
				endDate: endDate ? formatLocalDate(endDate) : '',
				orderBy,
				order,
			},
		})
			.then((response) => {
				setData(response.data || []);
			})
			.catch(() => setData([]));
	}

	// 🔹 Handle pagination & date changes
	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		requestData(pagination.pageSize, currentPage);
		setPageCount(Math.ceil(totalRows / pagination.pageSize));
	}, []);

	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		const date = filterData?.date || {
			start_date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
			end_date: new Date(),
		};
		setDateFilter(date);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.store,
			filterData?.orderBy,
			filterData?.order,
			date?.start_date,
			date?.end_date
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
						<option value="0">Admin</option>
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
			<Container>
				<Column>
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
						totalCounts={totalRows}
						realtimeFilter={realtimeFilter}
					/>
				</Column>
			</Container>
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<ProPopup
					confirmMode
					title={__('Are you sure?', 'multivendorx')}
					confirmMessage={__(
						'Are you sure you want to delete this abuse report?',
						'multivendorx'
					)}
					confirmYesText={__('Delete', 'multivendorx')}
					confirmNoText={__('Cancel', 'multivendorx')}
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedReport(null);
					}}
				/>
			</Dialog>
		</>
	);
};

export default PendingReportAbuse;
