/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	Table,
	getApiLink,
	TableCell,
	AdminBreadcrumbs,
	useModules,
	MultiCalendarInput,
	AdminButton,
	Container,
	Column,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import ViewCommission from './viewCommission';
import { formatCurrency, formatLocalDate, formatWcShortDate, } from '../../services/commonFunction';

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => ReactNode;
}

// Type declarations
type CommissionStatus = {
	key: string;
	name: string;
	count: number;
};

type CommissionRow = {
	createdAt: string;
	id?: number;
	orderId?: number;
	storeId?: number;
	storeName?: string;
	commissionAmount?: string;
	shipping?: string;
	tax?: string;
	commissionTotal?: string;
	commissionRefunded?: string;
	paidStatus?: 'paid' | 'unpaid' | string;
	commissionNote?: string | null;
	createTime?: string;
	totalOrderAmount?: any;
	facilitatorFee?: string;
	marketplaceFee?: string;
	gatewayFee?: string;
	shippingAmount?: string;
	taxAmount?: string;
	status?: string;
	storeEarning?: any;
	shippingTaxAmount?: any;
	platformFee?: any;
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
				startDate:formatLocalDate(filterData.date.start_date ?? ''),
				endDate:formatLocalDate(filterData.date.end_date??''),
			};

			// Add filters if present
			if (filterData?.store) {
				params.store_id = filterData.store;
			}
			if (filterData?.categoryFilter && filterData.categoryFilter !== 'all') {
				params.status = filterData.categoryFilter;
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
			const url = window.URL.createObjectURL(new Blob([response.data]));
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
				__('Failed to download CSV. Please try again.', 'multivendorx')
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
			<AdminButton
				buttons={{
					icon: 'download',
					text: __('Download CSV', 'multivendorx'),
					onClick: handleDownload,
					disabled:
						isDownloading || isLoading || (!hasSelectedRows && !data),
				}}
			/>
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
		<DownloadCSVButton
			selectedRows={selectedRows}
			data={data}
			filterData={filterData}
		/>
	);
};

const Commission: React.FC = () => {
	const [data, setData] = useState<CommissionRow[] | null>(null);
	const [store, setStore] = useState<any[] | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [viewCommission, setViewCommission] = useState(false);
	const [selectedCommissionId, setSelectedCommissionId] = useState<
		number | null
	>(null);
	const [currentFilterData, setCurrentFilterData] = useState<FilterData>({});
	const [expandedRows, setExpandedRows] = useState<{
		[key: number]: boolean;
	}>({});
	const { modules } = useModules();
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [commissionStatus, setCommissionStatus] = useState<
		CommissionStatus[] | null
	>(null);
	const [pageCount, setPageCount] = useState(0);
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

	const actionButton: RealtimeFilter[] = [
		{
			name: 'actionButton',
			render: () => (
				<>
					<ExportAllCSVButton filterData={currentFilterData} />
				</>
			),
		},
	];

	// Export All CSV Button Component - Downloads ALL filtered data
	const ExportAllCSVButton: React.FC<{
		filterData: FilterData;
	}> = ({ filterData }) => {
		const [isDownloading, setIsDownloading] = useState(false);

		const handleExportAll = async () => {
			setIsDownloading(true);
			try {
				// Prepare parameters for CSV download - NO pagination params
				const params: any = {
					format: 'csv',
					startDate:formatLocalDate(filterData.date.start_date ?? ''),
					endDate:formatLocalDate(filterData.date.end_date??''),
				};

				// Add filters if present
				if (filterData?.store) {
					params.store_id = filterData.store;
				}
				if (filterData?.categoryFilter && filterData.categoryFilter !== 'all') {
					params.status = filterData.categoryFilter;
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
				const filename = `commissions_all_${timestamp}.csv`;
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

		return (
			<AdminButton
				buttons={{
					icon: 'download',
					text: __('Download CSV', 'multivendorx'),
					onClick: handleExportAll,
					disabled: isDownloading,
					className: 'purple-bg',
				}}
			/>
		);
	};

	const handleSingleAction = (action: string, row: any) => {
		let commissionId = row.id;

		if (!commissionId) {
			return;
		}

		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `commission/${commissionId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { action, orderId: row?.orderId },
		})
			.then(() => {
				requestData(pagination.pageSize, pagination.pageIndex + 1);
			})
			.catch(console.error);
	};

	// Fetch data from backend.
	function requestData(
		rowsPerPage: number,
		currentPage: number,
		categoryFilter = '',
		store = '',
		orderBy = '',
		order = '',
		startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date(),
	) {
		setData(null);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'commission'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				status: categoryFilter === 'all' ? '' : categoryFilter,
				store_id: store,
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
			url: getApiLink(appLocalizer, 'commission'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { count: true },
		})
			.then((response) => {
				setTotalRows(response.data || 0);
				setPageCount(Math.ceil(response.data / pagination.pageSize));
			})
			.catch(() => { });
	}, []);

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
	}, [pagination]);

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
			filterData?.store,
			filterData?.orderBy,
			filterData?.order,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

	// Column definitions (your existing columns remain the same)
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
			cell: ({ row }) => (
				<TableCell title={'id'}>
					<span
						className="link-item"
						onClick={() => {
							setSelectedCommissionId(row.original.id ?? null);
							setViewCommission(true);
						}}
					>
						#{row.original.id}
					</span>
				</TableCell>
			),
		},
		{
			id: 'order_id',
			accessorKey: 'order_id',
			enableSorting: true,
			header: __('Order', 'multivendorx'),
			cell: ({ row }) => {
				const orderId = row.original.orderId;
				const url = orderId
					? `${appLocalizer.site_url.replace(
						/\/$/,
						''
					)}/wp-admin/post.php?post=${orderId}&action=edit`
					: '#';

				return (
					<TableCell title={orderId ? `#${orderId}` : '-'}>
						{orderId ? (
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="link-item"
							>
								#{orderId} - {row.original.storeName || '-'}
							</a>
						) : (
							'-'
						)}
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
							? `${row.original.totalOrderAmount}`
							: '-'
					}
				>
					{formatCurrency(row.original.totalOrderAmount)}
				</TableCell>
			),
		},
		{
			header: __('Commission Summary', 'multivendorx'),
			cell: ({ row }) => {
				const isExpanded = expandedRows[row.original.id!];

				return (
					<TableCell title={'commission-summary'}>
						<ul
							className={`details ${isExpanded ? '' : 'overflow'
								}`}
						>
							{row.original?.storeEarning ? (
								<li>
									<div className="item">
										<div className="des">Store Earning</div>
										<div className="title">
											{formatCurrency(
												row.original.storeEarning
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
									row.original?.marketplaceFee)) && (
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
														Platform Fee
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
										{__('Less', 'multivendorx')}
										<i className="adminfont-arrow-up"></i>
									</>
								) : (
									<>
										{__('More', 'multivendorx')}
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
			header: __('Store Earning', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={''}>
					{formatCurrency(row.original.storePayable)}
				</TableCell>
			),
		},
		{
			header: __('Marketplace Earning', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={''}>
					{formatCurrency(row.original.marketplacePayable)}
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
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							{
								label: __('View Commission', 'multivendorx'),
								icon: 'adminfont-eye',
								onClick: (rowData: any) => {
									setSelectedCommissionId(rowData.id ?? null);
									setViewCommission(true);
								},
							},
							{
								label: __(
									'Regenerate Commission',
									'multivendorx'
								),
								icon: 'adminfont-refresh refresh-icon',
								onClick: (rowData: any) => {
									handleSingleAction('regenerate', rowData);
								},
							},
						],
					}}
				/>
			),
		},
	];

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'store',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<select
					name="store"
					onChange={(e) =>
						updateFilter(e.target.name, e.target.value)
					}
					value={filterValue || ''}
					className="basic-select"
				>
					<option value="">
						{__('All Store', 'multivendorx')}
					</option>
					{store?.map((s: any) => (
						<option key={s.id} value={s.id}>
							{s.store_name.charAt(0).toUpperCase() +
								s.store_name.slice(1)}
						</option>
					))}
				</select>
			),
		},
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
			<AdminBreadcrumbs
				activeTabIcon="adminfont-commission"
				tabTitle={__('Commissions', 'multivendorx')}
				description={__(
					'Details of commissions earned by each store for every order, including order amount, commission rate, and payout status.',
					'multivendorx'
				)}
			/>
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
						realtimeFilter={realtimeFilter}
						pageCount={pageCount}
						pagination={pagination}
						onPaginationChange={setPagination}
						handlePagination={requestApiForData}
						perPageOption={[10, 25, 50]}
						categoryFilter={commissionStatus as CommissionStatus}
						bulkActionComp={() => (
							<BulkActions
								selectedRows={rowSelection}
								data={data}
								filterData={currentFilterData}
							/>
						)}
						totalCounts={totalRows}
						actionButton={actionButton}
					/>
				</Column>
			</Container>
			{viewCommission && selectedCommissionId !== null && (
				<ViewCommission
					open={viewCommission}
					onClose={() => setViewCommission(false)}
					commissionId={selectedCommissionId}
				/>
			)}
		</>
	);
};

export default Commission;
