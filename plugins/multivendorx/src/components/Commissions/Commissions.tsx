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
	ItemList,
} from 'zyra';
import ViewCommission from './ViewCommission';
import { formatCurrency, formatLocalDate, formatWordpressDate } from '../../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

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
	const [commissionLookup, setCommissionLookup] = useState<Record<number, WCTax>>({});
	const [viewCommission, setViewCommission] = useState(false);
	const [selectedCommissionId, setSelectedCommissionId] = useState<
		number | null
	>(null);

	const { modules } = useModules();

	const commissionColumns = (commission: CommissionRow) => ({
		[__('ID', 'multivendorx')]: commission.id ?? '',
		[__('Order', 'multivendorx')]: commission.orderId ?? '',
		[__('Order Amount', 'multivendorx')]: commission.totalOrderAmount ?? '',
		[__('Commission Summary', 'multivendorx')]: commission.commissionTotal ?? '',
		[__('Store Earning', 'multivendorx')]: commission.storeEarning ?? '',
		[__('Marketplace Earning', 'multivendorx')]: commission.marketplaceFee ?? '',
		[__('Status', 'multivendorx')]: commission.status ?? '',
		[__('Date', 'multivendorx')]: commission.createdAt ?? '',
	});

	const handleSingleAction = (action: string, id: number) => {
		if (!id) {
			return;
		}
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `commission/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { action, orderId: commissionLookup[id]?.orderId },
		})
			.then(() => {
				fetchData({})
			})
			.catch(console.error);
	};

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
						handleSingleAction('regenerate', id);
					},
				},
			],
		},
	];

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
				const lookup: Record<string, any> = {};
				const ids = items.map((item: any) => {
					lookup[item.id] = item;
					return item.id;
				});
				setRowIds(ids);
				setCommissionLookup(lookup);

				const mappedRows: any[][] = items.map((item: any) => [
					{
						display: (
							<span
								className="link-item"
								onClick={() => {
									setSelectedCommissionId(item.id ?? null);
									setViewCommission(true);
								}}
							>
								#{item.id}
							</span>
						),
						value: item.id,
					},
					// Order
					{
						type: 'card',
						data: {
							name: `#${item.orderId} – ${item.storeName || '-'}`,
							link: `${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${item.orderId}&action=edit`,
						},
						value: item.orderId
					},
					{
						display: (
							<ItemList
								className="feature-list"
								items={Object.entries(item)
									// Filter only the commission keys you want to show
									.filter(([key]) => [
										'storeEarning',
										'shippingAmount',
										'taxAmount',
										'gatewayFee',
										'marketplaceCommission'
									].includes(key))
									.map(([key, val]) => ({
										icon: 'adminfont-commissions', // Consistent icon
										title: key.replace(/([A-Z])/g, ' $1').trim(), // Formats 'storeEarning' to 'Store Earning'
										desc: val // This is your commission value (e.g. "112.00")
									}))
								}
							/>
						),
						value: item.id
					},
					// Order Amount
					{
						display: ann.totalOrderAmount
							? formatCurrency(item.currency_symbol , item.totalOrderAmount)
							: '-',
						value: item.totalOrderAmount ?? 0,
					},
					// Store Earning
					{
						display: formatCurrency(item.currency_symbol , item.storePayable),
						value: item.storePayable ?? 0,
					},

					// Marketplace Earning
					{
						display: formatCurrency(item.currency_symbol , item.marketplacePayable),
						value: item.marketplacePayable ?? 0,
					},

					// Status
					{
						display: item.status,
						value: item.status,
					},

					// Date
					{
						display: item.createdAt
							? formatWordpressDate(item.createdAt)
							: '-',
						value: item.createdAt ?? '',
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
			label: __('Download CSV', 'multivendorx'),
			icon: 'download',

			onClickWithQuery: (query: QueryProps) =>
				ExportCSV({
					url: getApiLink(appLocalizer, 'commission'),
					headers: { 'X-WP-Nonce': appLocalizer.nonce },

					filename:
						query.filter?.created_at?.startDate &&
							query.filter?.created_at?.endDate
							? `commissions-${formatLocalDate(query.filter.created_at.startDate)}-${formatLocalDate(query.filter.created_at.endDate)}.csv`
							: `commissions-${formatLocalDate(new Date())}.csv`,
					paramsBuilder: ({
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
				})(query),
		},
	];

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
								filename: `selected-commissions-${formatLocalDate(new Date())}.csv`,
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
