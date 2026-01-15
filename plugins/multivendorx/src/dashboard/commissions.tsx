/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	MultiCalendarInput,
	Table,
	TableCell,
	useModules,
} from 'zyra';
import {
	ColumnDef,
	PaginationState,
	RowSelectionState,
} from '@tanstack/react-table';
import ViewCommission from './viewCommission';
import { formatCurrency, formatLocalDate, formatWcShortDate } from '../services/commonFunction';

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => ReactNode;
}
type CommissionRow = {
	id: number;
	orderId: number;
	totalOrderAmount: string;
	commissionAmount: string;
	shippingAmount: string;
	taxAmount: string;
	commissionTotal: string;
	status: 'paid' | 'unpaid' | string;
};

type CommissionStatus = {
	key: string;
	name: string;
	count: number;
};

type FilterData = {
	searchAction?: string;
	searchField?: string;
	categoryFilter?: string;
	store?: string;
	order?: any;
	orderBy?: any;
	date?: {
		start_date: Date;
		end_date: Date;
	};
};
const StoreCommission: React.FC = () => {
	const [data, setData] = useState<CommissionRow[]>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [modalCommission, setModalCommission] =
		useState<CommissionRow | null>(null);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pageCount, setPageCount] = useState(0);
	const { modules } = useModules();
	const [expandedRows, setExpandedRows] = useState<{
		[key: number]: boolean;
	}>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [currentFilterData, setCurrentFilterData] = useState<FilterData>({});
	const [dateFilter, setDateFilter] = useState<{
		start_date: Date;
		end_date: Date;
	}>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});
	const [commissionStatus, setCommissionStatus] = useState<
		CommissionStatus[] | null
	>(null);

	// Fetch total rows on mount
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'commission'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { count: true, store_id: appLocalizer.store_id },
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
		orderBy = '',
		order = '',
		startDate = new Date( new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date()
	) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'commission'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				store_id: appLocalizer.store_id,
				page: currentPage,
				row: rowsPerPage,
				status: typeCount === 'all' ? '' : typeCount,
				orderBy,
				order,
				startDate: startDate ? formatLocalDate(startDate) : '',
				endDate: endDate ? formatLocalDate(endDate) : '',	
			},
		})
			.then((response) => {
				setData(response.data.commissions || []);
				setTotalRows(response.data.all || 0);
				setPageCount(Math.ceil(response.data.all / pagination.pageSize));

				const statuses = [
					{ key: 'all', name: 'All', count: response.data.all || 0 },
					{
						key: 'paid',
						name: 'Paid',
						count: response.data.paid || 0,
					},
					{
						key: 'unpaid',
						name: 'Unpaid',
						count: response.data.unpaid || 0,
					},
					{
						key: 'refunded',
						name: 'Refunded',
						count: response.data.refunded || 0,
					},
					{
						key: 'partially_refunded',
						name: 'Partially Refunded',
						count: response.data.partially_refunded || 0,
					},
					{
						key: 'cancelled',
						name: 'Cancelled',
						count: response.data.cancelled || 0,
					},
				];

				// Remove items where count === 0
				setCommissionStatus(
					statuses.filter((status) => status.count > 0)
				);
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
		setCurrentFilterData(filterData);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.categoryFilter,
			filterData?.orderBy,
			filterData?.order,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

	// CSV Download Button Component
	const DownloadCSVButton: React.FC<{
		selectedRows: RowSelectionState;
		data: CommissionRow[] | null;
		filterData: FilterData;
		isLoading?: boolean;
	}> = ({ selectedRows, data, filterData, isLoading = false }) => {
		const [isDownloading, setIsDownloading] = useState(false);

		const handleDownload = async () => {
			setIsDownloading(true);
			try {
				// Get selected row IDs
				const selectedIds = Object.keys(selectedRows)
					.filter((key) => selectedRows[key])
					.map((key) => {
						const rowIndex = parseInt(key);
						return data?.[rowIndex]?.id;
					})
					.filter((id) => id !== undefined);

				// Prepare parameters for CSV download
				const params: any = {
					format: 'csv',
					startDate: filterData?.date?.start_date
						? filterData.date.start_date.toISOString().split('T')[0]
						: '',
					endDate: filterData?.date?.end_date
						? filterData.date.end_date.toISOString().split('T')[0]
						: '',
				};

				// Add filters if present
				if (filterData?.store) {
					params.store_id = filterData.store;
				}
				if (filterData?.typeCount && filterData.typeCount !== 'all') {
					params.status = filterData.typeCount;
				}

				// If specific rows are selected, send their IDs
				if (selectedIds.length > 0) {
					params.ids = selectedIds.join(',');
				}

				// Make API request for CSV
				const response = await axios({
					method: 'GET',
					url: getApiLink(appLocalizer, 'commission'),
					headers: {
						'X-WP-Nonce': appLocalizer.nonce,
						Accept: 'text/csv',
					},
					params: params,
					responseType: 'blob',
				});

				// Create download link
				const url = window.URL.createObjectURL(
					new Blob([response.data])
				);
				const link = document.createElement('a');
				link.href = url;

				// Generate filename with timestamp
				const timestamp = new Date().toISOString().split('T')[0];
				const filename = `commissions_${timestamp}.csv`;
				link.setAttribute('download', filename);

				document.body.appendChild(link);
				link.click();
				link.remove();
				window.URL.revokeObjectURL(url);
			} catch (error) {
				console.error('Error downloading CSV:', error);
				alert(
					__(
						'Failed to download CSV. Please try again.',
						'multivendorx'
					)
				);
			} finally {
				setIsDownloading(false);
			}
		};

		const hasSelectedRows = Object.keys(selectedRows).some(
			(key) => selectedRows[key]
		);

		return (
			<div className="action-item">
				<button
					onClick={handleDownload}
					disabled={
						isDownloading ||
						isLoading ||
						(!hasSelectedRows && !data)
					}
					className="admin-btn"
				>
					<i className="adminfont-download"></i>
					{__('Download CSV', 'multivendorx')}
				</button>
			</div>
		);
	};

	// Bulk Actions Component
	const BulkActions: React.FC<{
		selectedRows: RowSelectionState;
		data: CommissionRow[] | null;
		filterData: FilterData;
		onActionComplete?: () => void;
	}> = ({ selectedRows, data, filterData, onActionComplete }) => {
		return (
			<div>
				<DownloadCSVButton
					selectedRows={selectedRows}
					data={data}
					filterData={filterData}
				/>
				{/* Add other bulk actions here if needed */}
			</div>
		);
	};
	const handleExportAll = async () => {
		try {
			const params: any = {
				format: 'csv',
				startDate: currentFilterData?.date?.start_date
					? currentFilterData.date.start_date
							.toISOString()
							.split('T')[0]
					: '',
				endDate: currentFilterData?.date?.end_date
					? currentFilterData.date.end_date
							.toISOString()
							.split('T')[0]
					: '',
			};

			if (currentFilterData?.store) {
				params.store_id = currentFilterData.store;
			}

			if (
				currentFilterData?.typeCount &&
				currentFilterData.typeCount !== 'all'
			) {
				params.status = currentFilterData.typeCount;
			}

			const response = await axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'commission'),
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
					Accept: 'text/csv',
				},
				params,
				responseType: 'blob',
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;

			const timestamp = new Date().toISOString().split('T')[0];
			link.setAttribute('download', `commissions_${timestamp}.csv`);

			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error exporting CSV:', error);
			alert(
				__('Failed to export CSV. Please try again.', 'multivendorx')
			);
		}
	};

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
			header: __('ID', 'multivendorx'),
			cell: ({ row }) => <TableCell>#{row.original.id}</TableCell>,
		},
		{
			id: 'orderId',
			accessorKey: 'orderId',
			enableSorting: true,
			header: __('Order ID', 'multivendorx'),
			cell: ({ row }: any) => {
				const orderId = row.original.orderId;
				const orderLink = `/dashboard/sales/orders/#view/${orderId}`;

				return (
					<TableCell title={orderId ? `#${orderId}` : '-'}>
						{orderId ? <a href={orderLink}>#{orderId}</a> : '-'}
					</TableCell>
				);
			},
		},
		{
			header: __('Order Amount', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					title={
						row.original.totalOrderAmount
							? `${appLocalizer.currency_symbol}${row.original.totalOrderAmount}`
							: '-'
					}
				>
					{row.original.totalOrderAmount
						? formatCurrency(row.original.totalOrderAmount)
						: '-'}
				</TableCell>
			),
		},
		{
			header: __('Commission Summary', 'multivendorx'),
			cell: ({ row }) => {
				const isExpanded = expandedRows[row.original.id!];

				return (
					<TableCell>
						<ul
							className={`details ${
								isExpanded ? '' : 'overflow'
							}`}
						>
							{row.original?.commissionAmount ? (
								<li>
									<div className="item">
										<div className="des">
											Commission Earned
										</div>
										<div className="title">
											{formatCurrency(
												row.original.commissionAmount
											)}
										</div>
									</div>
								</li>
							) : null}
							{modules.includes('store-shipping') &&
								row.original?.shippingAmount && (
									<li>
										{row.original?.shippingAmount && (
											<div className="item">
												<div className="des">
													Shipping
												</div>
												<div className="title">
													+{' '}
													{formatCurrency(
														row.original
															.shippingAmount
													)}
												</div>
											</div>
										)}
									</li>
								)}
							{row.original?.taxAmount && appLocalizer.settings_databases_value['store-commissions']?.give_tax !== 'no_tax' && (
								<li>
									{row.original?.taxAmount && (
										<div className="item">
											<div className="des">Tax</div>
											<div className="title">
												+{' '}
												{formatCurrency(
													row.original.taxAmount
												)}
											</div>
										</div>
									)}
								</li>
							)}
							{row.original?.shippingTaxAmount && (
								<li>
									{row.original?.shippingTaxAmount && (
										<div className="item">
											<div className="des">
												Shipping Tax
											</div>
											<div className="title">
												+{' '}
												{formatCurrency(
													row.original
														.shippingTaxAmount
												)}
											</div>
										</div>
									)}
								</li>
							)}
							{((modules.includes('marketplace-gateway') &&
								row.original?.gatewayFee) ||
								(modules.includes('facilitator') &&
									row.original?.facilitatorFee) ||
								(modules.includes('marketplace-fee') &&
									row.original?.platformFee)) && (
								<li>
									{modules.includes('marketplace-gateway') &&
										row.original?.gatewayFee && (
											<div className="item">
												<div className="des">
													Gateway Fee
												</div>
												<div className="title">
													-{' '}
													{formatCurrency(
														row.original.gatewayFee
													)}
												</div>
											</div>
										)}

									{modules.includes('facilitator') &&
										row.original?.facilitatorFee && (
											<div className="item">
												<div className="des">
													Facilitator Fee
												</div>
												<div className="title">
													-{' '}
													{formatCurrency(
														row.original
															.facilitatorFee
													)}
												</div>
											</div>
										)}

									{modules.includes('marketplace-fee') &&
										row.original?.platformFee && (
											<div className="item">
												<div className="des">
													Marketplace Fee
												</div>
												<div className="title">
													-{' '}
													{formatCurrency(
														row.original.platformFee
													)}
												</div>
											</div>
										)}
								</li>
							)}

							<span
								className="more-btn"
								onClick={() =>
									setExpandedRows((prev) => ({
										...prev,
										[row.original.id!]:
											!prev[row.original.id!],
									}))
								}
							>
								{isExpanded ? (
									<>
										Less{' '}
										<i className="adminfont-arrow-up"></i>
									</>
								) : (
									<>
										More{' '}
										<i className="adminfont-arrow-down"></i>
									</>
								)}
							</span>
						</ul>
					</TableCell>
				);
			},
		},
		{
			header: __('Total Earned ', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					title={
						row.original.storePayable
							? `${appLocalizer.currency_symbol}${row.original.storePayable}`
							: '-'
					}
				>
					{row.original.storePayable
						? formatCurrency(row.original.storePayable)
						: '-'}
				</TableCell>
			),
		},
		{
			id: 'created_at',
			accessorKey: 'created_at',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={''}>
					{formatWcShortDate(row.original.createdAt)}
				</TableCell>
			),
		},
		{
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell type="status" status={row.original.status} />;
			},
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => {
				const isPaid = row.original.status === 'paid';

				return (
					<TableCell
						type="action-dropdown"
						rowData={row.original}
						header={{
							actions: isPaid
								? [
										{
											label: __(
												'View Commission',
												'multivendorx'
											),
											icon: 'adminfont-eye',
											onClick: (rowData) => {
												setModalCommission(rowData);
											},
											hover: true,
										},
									]
								: [],
						}}
					/>
				);
			},
		},
	];

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'date',
			render: (updateFilter) => (
				<MultiCalendarInput
					value={{
						startDate: dateFilter.start_date,
						endDate: dateFilter.end_date,
					}}
					onChange={(range: { startDate: Date; endDate: Date }) => {
						const next = {
							start_date: range.startDate,
							end_date: range.endDate,
						};

						setDateFilter(next);
						updateFilter('date', next);
					}}
				/>
			),
		},
	];

	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Commission', 'multivendorx')}
					</div>
					<div className="des">
						{__(
							'Details of commissions earned by your store for every order, including order amount, commission rate and payout status.',
							'multivendorx'
						)}
					</div>
				</div>

				<div className="buttons-wrapper">
					<button
						className="admin-btn btn-purple-bg"
						onClick={handleExportAll}
					>
						<i className="adminfont-export"></i>
						{__('Export', 'multivendorx')}
					</button>
				</div>
			</div>
			<Table
				data={data}
				columns={columns as ColumnDef<Record<string, any>, any>[]}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				pagination={pagination}
				onPaginationChange={setPagination}
				handlePagination={requestApiForData}
				defaultRowsPerPage={10}
				perPageOption={[10, 25, 50]}
				categoryFilter={commissionStatus as CommissionStatus}
				totalCounts={totalRows}
				pageCount={pageCount}
				realtimeFilter={realtimeFilter}
				bulkActionComp={() => (
					<BulkActions
						selectedRows={rowSelection}
						data={data}
						filterData={currentFilterData}
					/>
				)}
			/>

			{modalCommission && (
				<ViewCommission
					open={!!modalCommission}
					onClose={() => setModalCommission(null)}
					commissionId={modalCommission.id}
				/>
			)}
		</>
	);
};

export default StoreCommission;
