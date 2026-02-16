/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	NavigatorHeader,
	useModules,
	Container,
	Column,
	TableCard,
	ExportCSV,
} from 'zyra';
import ViewCommission from './ViewCommission';
import { formatCurrency, formatLocalDate } from '../../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';
import { getCommissionSummaryDisplay } from './Utill';

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


const Commission: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);
	const [store, setStore] = useState<any[] | null>(null);


	const [data, setData] = useState<CommissionRow[] | null>(null);
	const [viewCommission, setViewCommission] = useState(false);
	const [selectedCommissionId, setSelectedCommissionId] = useState<
		number | null
	>(null);
	const [expandedRows, setExpandedRows] = useState<{
		[key: number]: boolean;
	}>({});
	const { modules } = useModules();

	const commissionColumns = (c: any) => ({
		ID: c.id,
		Store: c.storeName || '',
		Order_ID: c.orderId || '',
		Status: c.status || '',
		'Total Order Amount': c.totalOrderAmount || '',
		'Net Items Cost': c.netItemsCost || '',
		'Store Earning': c.storeEarning || '',
		'Marketplace Commission': c.marketplaceCommission || '',
		'Gateway Fee': c.gatewayFee || '',
		'Shipping Amount': c.shippingAmount || '',
		'Tax Amount': c.taxAmount || '',
		'Shipping Tax Amount': c.shippingTaxAmount || '',
		'Store Discount': c.storeDiscount || '',
		'Admin Discount': c.adminDiscount || '',
		'Store Payable': c.storePayable || '',
		'Marketplace Payable': c.marketplacePayable || '',
		'Store Refunded': c.storeRefunded || '',
		Date: c.createdAt || '',
		Note: c.commissionNote || '',
	  });	  

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
				fetchData({})
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
		searchAction = '',
		searchValue = '',
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
				searchAction,
				searchValue,
			},
		})
			.then((response) => {

			})
			.catch(() => {
				setData([]);
			});
	}

	// Fetch total rows on mount
	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const options =
					(response.data || []).map((store: any) => ({
						label: store.store_name,
						value: store.id,
					}));

				setStore(options);
				setIsLoading(false);
			})
			.catch(() => {
				setStore([]);
				setIsLoading(false);
			});

	}, []);

	const headers = [
		{ key: 'id', label: 'ID' },
		{ key: 'order_id', label: 'Order' },
		{ key: 'order_amount', label: 'Order Amount' },
		{ key: 'commission_summary', label: 'Commission Summary' },
		{ key: 'store_earning', label: 'Store Earning' },
		{ key: 'marketplace_earning', label: 'Marketplace Earning' },
		{ key: 'status', label: 'Status' },
		{ key: 'created_at', label: 'Date', isSorting: true },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('View Commission', 'multivendorx'),
					icon: 'eye',
					onClick: (id: number) => {
						setSelectedCommissionId(id);
						setViewCommission(true);
					},
				},
				{
					label: __(
						'Regenerate Commission',
						'multivendorx'
					),
					icon: 'refresh',
					onClick: (id: number) => {
						// handleSingleAction('regenerate', rowData);
					},
				},
			],
		},
	];

	const getCommissionSummaryDisplay = (
		ann: any,
		isExpanded: boolean,
		setExpandedRows: React.Dispatch<
			React.SetStateAction<Record<number, boolean>>
		>,
		modules: string[]
	) => {
		return (
			<ul className={`details ${isExpanded ? '' : 'overflow'}`}>
				{ann?.storeEarning && (
					<li>
						<div className="item">
							<div className="des">Store Earning</div>
							<div className="title">
								{formatCurrency(ann.storeEarning)}
							</div>
						</div>
					</li>
				)}

				{modules.includes('store-shipping') && ann?.shippingAmount && (
					<li>
						<div className="item">
							<div className="des">Shipping</div>
							<div className="title">
								+ {formatCurrency(ann.shippingAmount)}
							</div>
						</div>
					</li>
				)}

				{ann?.taxAmount &&
					appLocalizer.settings_databases_value['commissions']
						?.give_tax !== 'no_tax' && (
						<li>
							<div className="item">
								<div className="des">Tax</div>
								<div className="title">
									+ {formatCurrency(ann.taxAmount)}
								</div>
							</div>
						</li>
					)}

				{ann?.shippingTaxAmount && (
					<li>
						<div className="item">
							<div className="des">Shipping Tax</div>
							<div className="title">
								+ {formatCurrency(ann.shippingTaxAmount)}
							</div>
						</div>
					</li>
				)}

				{((modules.includes('marketplace-gateway') && ann?.gatewayFee) ||
					(modules.includes('facilitator') && ann?.facilitatorFee) ||
					(modules.includes('marketplace-fee') && ann?.platformFee)) && (
						<li>
							{modules.includes('marketplace-gateway') &&
								ann?.gatewayFee && (
									<div className="item">
										<div className="des">Gateway Fee</div>
										<div className="title">
											- {formatCurrency(ann.gatewayFee)}
										</div>
									</div>
								)}

							{modules.includes('facilitator') &&
								ann?.facilitatorFee && (
									<div className="item">
										<div className="des">
											Facilitator Fee
										</div>
										<div className="title">
											-{' '}
											{formatCurrency(ann.facilitatorFee)}
										</div>
									</div>
								)}

							{modules.includes('marketplace-fee') &&
								ann?.platformFee && (
									<div className="item">
										<div className="des">Platform Fee</div>
										<div className="title">
											-{' '}
											{formatCurrency(ann.platformFee)}
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
							[ann.id!]: !prev[ann.id!],
						}))
					}
				>
					{isExpanded ? (
						<>
							{__('Less', 'multivendorx')}
							<i className="adminfont-arrow-up" />
						</>
					) : (
						<>
							{__('More', 'multivendorx')}
							<i className="adminfont-arrow-down" />
						</>
					)}
				</span>
			</ul>
		);
	};

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
					searchValue: query.searchValue || '',
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					store_id: query.filter?.store_id,
					orderBy: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((ann: any) => ann?.id != null)
					.map((ann: any) => ann.id);

				setRowIds(ids);

				const mappedRows: any[][] = items.map((ann: any) => [
					{
						display: (
							<span
								className="link-item"
								onClick={() => {
									setSelectedCommissionId(ann.id ?? null);
									setViewCommission(true);
								}}
							>
								#{ann.id}
							</span>
						),
						value: ann.id,
					},
					// Order
					{
						display: ann.orderId ? (
							<a
								href={`${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${ann.orderId}&action=edit`}
								target="_blank"
								rel="noopener noreferrer"
								className="link-item"
							>
								#{ann.orderId} – {ann.storeName || '-'}
							</a>
						) : (
							'-'
						),
						value: ann.orderId ?? '',
					},
					{
						display: getCommissionSummaryDisplay(
							ann,
							!!expandedRows[ann.id],
							setExpandedRows,
							modules
						),
						value: ann.id,
					},
					// Order Amount
					{
						display: ann.totalOrderAmount
							? formatCurrency(ann.totalOrderAmount)
							: '-',
						value: ann.totalOrderAmount ?? 0,
					},
					// Store Earning
					{
						display: formatCurrency(ann.storePayable),
						value: ann.storePayable ?? 0,
					},

					// Marketplace Earning
					{
						display: formatCurrency(ann.marketplacePayable),
						value: ann.marketplacePayable ?? 0,
					},

					// Status
					{
						display: ann.status,
						value: ann.status,
					},

					// Date
					{
						display: ann.createdAt
							? ann.createdAt
							: '-',
						value: ann.createdAt ?? '',
					},
				]);

				setRows(mappedRows);

				setCategoryCounts([
					{
						value: 'all',
						label: 'All',
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'paid',
						label: 'Paid',
						count: Number(response.headers['x-wp-status-paid']) || 0,
					},
					{
						value: 'unpaid',
						label: 'Unpaid',
						count: Number(response.headers['x-wp-status-unpaid']) || 0,
					},
					{
						value: 'refunded',
						label: 'Refunded',
						count: Number(response.headers['x-wp-status-refunded']) || 0,
					},
					{
						value: 'partially_refunded',
						label: 'Partially Refunded',
						count: Number(response.headers['x-wp-status-partially-refunded']) || 0,
					},
					{
						value: 'cancelled',
						label: 'Cancelled',
						count: Number(response.headers['x-wp-status-cancelled']) || 0,
					},
				]);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const filters = [
		{
			key: 'store_id',
			label: 'Stores',
			type: 'select',
			options: store,
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const buttonActions = [
		{
		  label: 'Download CSV',
		  icon: 'download',
		  onClickWithQuery: ExportCSV({
			url: getApiLink(appLocalizer, 'commission'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			filename: 'commissions.csv',
	  
			paramsBuilder: (query) => ({
			  page: 1,
			  row: 100,
			  status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
			  searchValue: query.searchValue || '',
			  startDate: query.filter?.created_at?.startDate
				? formatLocalDate(query.filter.created_at.startDate)
				: '',
			  endDate: query.filter?.created_at?.endDate
				? formatLocalDate(query.filter.created_at.endDate)
				: '',
			  store_id: query.filter?.store_id,
			  orderBy: query.orderby,
			  order: query.order,
			}),
	  
			columns: commissionColumns,
		  }),
		},
	];

	const mapCommissionsToCSV = (commissions: any[]) =>
		commissions.map((c) => ({
			ID: c.id,
			Store: c.storeName || '',
			Order_ID: c.orderId || '',
			Status: c.status || '',
			'Total Order Amount': c.totalOrderAmount
				? formatCurrency(c.totalOrderAmount)
				: '',
			'Net Items Cost': c.netItemsCost
				? formatCurrency(c.netItemsCost)
				: '',
			'Store Earning': c.storeEarning
				? formatCurrency(c.storeEarning)
				: '',
			'Marketplace Commission': c.marketplaceCommission
				? formatCurrency(c.marketplaceCommission)
				: '',
			'Gateway Fee': c.gatewayFee
				? formatCurrency(c.gatewayFee)
				: '',
			'Shipping Amount': c.shippingAmount
				? formatCurrency(c.shippingAmount)
				: '',
			'Tax Amount': c.taxAmount
				? formatCurrency(c.taxAmount)
				: '',
			'Shipping Tax Amount': c.shippingTaxAmount
				? formatCurrency(c.shippingTaxAmount)
				: '',
			'Store Discount': c.storeDiscount
				? formatCurrency(c.storeDiscount)
				: '',
			'Admin Discount': c.adminDiscount
				? formatCurrency(c.adminDiscount)
				: '',
			'Store Payable': c.storePayable
				? formatCurrency(c.storePayable)
				: '',
			'Marketplace Payable': c.marketplacePayable
				? formatCurrency(c.marketplacePayable)
				: '',
			'Store Refunded': c.storeRefunded
				? formatCurrency(c.storeRefunded)
				: '',
			Date: c.createdAt ? c.createdAt : '',
			Note: c.commissionNote || '',
		}));


	return (
		<>
			<NavigatorHeader
				headerIcon="commission"
				headerTitle={__('Commissions', 'multivendorx')}
				headerDescription={__(	
					'Details of commissions earned by each store for every order, including order amount, commission rate, and payout status.',
					'multivendorx'
				)}
			/>
			<Container general>
				<Column>
					<TableCard
						headers={headers}
						rows={rows}
						totalRows={totalRows}
						isLoading={isLoading}
						onQueryUpdate={fetchData}
						ids={rowIds}
						categoryCounts={categoryCounts}
						search={{}}
						filters={filters}
						buttonActions={buttonActions}
						bulkActions={[]}
						onSelectCsvDownloadApply={(selectedIds: number[]) => {
							ExportCSV({
							  url: getApiLink(appLocalizer, 'commission'),
							  headers: { 'X-WP-Nonce': appLocalizer.nonce },
							  filename: 'selected-commissions.csv',
							  paramsBuilder: () => ({ ids: selectedIds }),
							  columns: commissionColumns,
							})({});
						}}						  
						format={appLocalizer.date_format}
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
