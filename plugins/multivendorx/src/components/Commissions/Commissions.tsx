/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	NavigatorHeader,
	Container,
	Column,
	TableCard,
	TableRow,
	QueryProps,
	CategoryCount,
	ItemListUI,
	useModules,
} from 'zyra';
import ViewCommission from './ViewCommission';
import {
	downloadCSV,
	formatCurrency,
	formatLocalDate,
	getUrl,
} from '../../services/commonFunction';
type StoreOption = {
	label: string;
	value: number;
};
const Commission: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);
	const [store, setStore] = useState<StoreOption[] | null>(null);
	const [viewCommission, setViewCommission] = useState(false);
	const [selectedCommissionId, setSelectedCommissionId] = useState<
		number | string | null
	>(null);
	const { modules } = useModules();

	const handleSingleAction = (action: string, row) => {
		if (!row.id) {
			return;
		}
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `commission/${row.order_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { action, order_id: row.order_id },
		})
			.then(() => {
				doRefreshTableData({});
			})
			.catch(console.error);
	};

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { options: true },
			})
			.then((response) => {
				const options = (response.data || []).map((store) => ({
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
	const headers = {
		id: {
			label: __('ID', 'multivendorx'),
			isSortable: true,
			render: (row) => (
				<span
					onClick={() => {
						setSelectedCommissionId(row.id ?? null);
						setViewCommission(true);
					}}
				>
					#{row.id}
				</span>
			),
		},
		order_id: {
			label: __('Order', 'multivendorx'),
			isSortable: true,
			render: (row) => (
				<a
					href={getUrl(row.order_id, 'order')}
					target="_blank"
					rel="noopener noreferrer"
					className="link-item"
				>
					#{row.order_id} - {row.store_name || '-'}
				</a>
			),
		},
		total_order_amount: {
			label: __('Order Amount', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
		commission_summary: {
			label: __('Commission Summary', 'multivendorx'),
			width: 20,
			render: (row) => {
				const earningItems = [
					{
						title: 'Store Earning',
						display: true,
						value: formatCurrency(row.store_earning),
					},
					{
						title: 'Shipping Amount',
						display: modules.includes('store-shipping'),
						value: '+' + formatCurrency(row.shipping_amount),
					},
					{
						title: 'Tax Amount',
						display: appLocalizer.taxes_enabled ==='yes',
						value: '+' + formatCurrency(row.tax_amount),
					},
					{
						title: 'Gateway Fee',
						display: modules.includes('marketplace-gateway'),
						value: '-' + formatCurrency(row.gateway_fee),
					},
					{
						title: 'Marketplace Commission',
						display: true,
						value: '-' + formatCurrency(row.marketplace_commission),
					},
					{
						title: 'Store Discount',
						display: Number(row.store_discount) !== 0,
						value: '-' + formatCurrency(row.store_discount),
					},
					{
						title: 'Admin Discount',
						display: Number(row.admin_discount) !== 0,
						value: formatCurrency(row.admin_discount),
					},
				].filter(item => item.display !== false);

				return (
					<ItemListUI
						className="price-list"
						items={earningItems}
					/>
				);
			},
			csvDisplay: false,
		},
		store_payable: {
			label: __('Store Earning', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
		marketplace_payable: {
			label: __('Marketplace Earning', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},
		created_at: {
			label: __('Date', 'multivendorx'),
			isSortable: true,
			type: 'date',
		},
		action: {
			label: __('Action', 'multivendorx'),
			type: 'action',
			csvDisplay: false,
			actions: [
				{
					label: __('View Commission', 'multivendorx'),
					icon: 'eye',
					onClick: (row) => {
						setSelectedCommissionId(row.id);
						setViewCommission(true);
					},
				},
				{
					label: __('Regenerate Commission', 'multivendorx'),
					icon: 'refresh',
					onClick: (row) => {
						handleSingleAction('regenerate', row);
					},
				},
			],
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: buildCommissionQueryParams(query),
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items.map((item) => {
					return item.id;
				});
				setRowIds(ids);

				setRows(items);

				setCategoryCounts([
					{
						value: 'all',
						label: __('All', 'multivendorx'),
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'paid',
						label: __('Paid', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-paid']) || 0,
					},
					{
						value: 'unpaid',
						label: __('Unpaid', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-unpaid']) || 0,
					},
					{
						value: 'refunded',
						label: __('Refunded', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-refunded']) ||
							0,
					},
					{
						value: 'partially_refunded',
						label: __('Partially Refunded', 'multivendorx'),
						count:
							Number(
								response.headers[
								'x-wp-status-partially-refunded'
								]
							) || 0,
					},
					{
						value: 'cancelled',
						label: __('Cancelled', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-cancelled']) ||
							0,
					},
				]);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
				console.error(error);
			});
	};

	const filters = [
		{
			key: 'store_id',
			label: __('Stores', 'multivendorx'),
			type: 'select',
			options: store,
		},
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	const downloadCommissionsCSV = (selectedIds: number[]) => {
		if (!selectedIds) {
			return;
		}

		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { ids: selectedIds },
			})
			.then((response) => {
				const rows = response.data || [];
				downloadCSV(
					headers,
					rows,
					`selected-commissions-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};
	const downloadCommissionsCSVByQuery = (query: QueryProps) => {
		// Call the API
		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: buildCommissionQueryParams(query, false),
			})
			.then((response) => {
				const rows = response.data || [];

				downloadCSV(
					headers,
					rows,
					`commissions-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};

	const buildCommissionQueryParams = (
		query: QueryProps,
		includePagination: boolean = true
	) => {
		const params = {
			status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
			search_value: query.searchValue || '',
			start_date: query.filter?.created_at?.startDate
				? formatLocalDate(query.filter.created_at.startDate)
				: '',
			end_date: query.filter?.created_at?.endDate
				? formatLocalDate(query.filter.created_at.endDate)
				: '',
			store_id: query.filter?.store_id || '',
			order_by: query.orderby,
			order: query.order,
		};

		if (includePagination) {
			params.page = query.paged || 1;
			params.row = query.per_page || 10;
		}

		return params;
	};

	const buttonActions = [
		{
			label: __('Download CSV', 'multivendorx'),
			icon: 'download',
			onClickWithQuery: downloadCommissionsCSVByQuery,
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
						onQueryUpdate={doRefreshTableData}
						ids={rowIds}
						categoryCounts={categoryCounts}
						search={{}}
						filters={filters}
						buttonActions={buttonActions}
						bulkActions={[]}
						onSelectCsvDownloadApply={downloadCommissionsCSV}
						format={appLocalizer.date_format}
						currency={{
							currencySymbol: appLocalizer.currency_symbol,
							priceDecimals: appLocalizer.price_decimals,
							decimalSeparator: appLocalizer.decimal_separator,
							thousandSeparator: appLocalizer.thousand_separator,
							currencyPosition: appLocalizer.currency_position,
						}}
					/>
				</Column>
			</Container>
			<ViewCommission
				open={viewCommission}
				onClose={() => setViewCommission(false)}
				commissionId={selectedCommissionId}
			/>
		</>
	);
};

export default Commission;
