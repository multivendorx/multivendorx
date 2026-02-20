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
	ItemList,
	TableRow,
	QueryProps,
	CategoryCount,
} from 'zyra';
import ViewCommission from './ViewCommission';
import { downloadCSV, formatLocalDate } from '../../services/commonFunction';

const Commission: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);
	const [store, setStore] = useState<any[] | null>(null);
	const [commissionLookup, setCommissionLookup] = useState<
		Record<number, WCTax>
	>({});
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
			method: 'PUT',
			url: getApiLink(appLocalizer, `commission/${row.id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { action, orderId: row.orderId },
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
			})
			.then((response) => {
				const options = (response.data || []).map((store: any) => ({
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
		},
		order_id: {
			label: __('Order', 'multivendorx'),
			isSortable: true,
		},
		total_order_amount: {
			label: __('Order Amount', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
		commission_summary: {
			label: __('Commission Summary', 'multivendorx'),
			render: (row) => (
				<ItemList
					className="price-list"
					items={Object.entries(row)
						.filter(([key]) =>
							[
								'store_earning',
								'shipping_amount',
								'tax_amount',
								'gateway_fee',
								'marketplace_commission',
							].includes(key)
						)
						.map(([key, val]) => ({
							title: key
								.split('_')
								.map(
									(w) =>
										w.charAt(0).toUpperCase() + w.slice(1)
								)
								.join(' '),
							value: val,
						}))
					}
				/>
			),
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
				const ids = items.map((item: any) => {
					return item.id;
				});
				setRowIds(ids);

				setRows(items);

				setCategoryCounts([
					{
						value: 'all',
						label: 'All',
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'paid',
						label: 'Paid',
						count:
							Number(response.headers['x-wp-status-paid']) || 0,
					},
					{
						value: 'unpaid',
						label: 'Unpaid',
						count:
							Number(response.headers['x-wp-status-unpaid']) || 0,
					},
					{
						value: 'refunded',
						label: 'Refunded',
						count:
							Number(response.headers['x-wp-status-refunded']) ||
							0,
					},
					{
						value: 'partially_refunded',
						label: 'Partially Refunded',
						count:
							Number(
								response.headers[
									'x-wp-status-partially-refunded'
								]
							) || 0,
					},
					{
						value: 'cancelled',
						label: 'Cancelled',
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
		const params: Record<string, any> = {
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
