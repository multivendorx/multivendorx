/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	ItemList,
	NavigatorHeader,
	TableCard,
	useModules,
} from 'zyra';

import ViewCommission from './viewCommission';
import { downloadCSV, formatLocalDate } from '../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

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

const StoreCommission: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);
	const [modalCommission, setModalCommission] =
		useState<CommissionRow | null>(null);
	const { modules } = useModules();

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
					className="feature-list"
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
							icon: 'adminfont-commissions',
							title: key
								.split('_')
								.map(
									(w) =>
										w.charAt(0).toUpperCase() + w.slice(1)
								)
								.join(' '),
							desc: val,
						}))}
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
						setModalCommission(row);
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
				params: buildCommissionQueryParams,
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item) => item?.id != null)
					.map((item) => item.id);

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
			search_action: query.searchAction || 'commission_id',
			search_value: query.searchValue || '',
			start_date: query.filter?.created_at?.startDate
				? formatLocalDate(query.filter.created_at.startDate)
				: '',
			end_date: query.filter?.created_at?.endDate
				? formatLocalDate(query.filter.created_at.endDate)
				: '',
			store_id: appLocalizer.store_id,
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
				headerTitle={__('Commission', 'multivendorx')}
				headerDescription={__(
					'Details of commissions earned by your store for every order, including order amount, commission rate and payout status.',
					'multivendorx'
				)}
				buttons={[
					{
						label: __('Export', 'multivendorx'),
						icon: 'export',
						// onClick: handleExportAll
					},
				]}
			/>

			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{
					placeholder: 'Search...',
					options: [
						{ label: 'Commission Id', value: 'commission_id' },
						{ label: 'Order Id', value: 'order_id' },
					],
				}}
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
