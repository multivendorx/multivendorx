/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';


import { getApiLink, useModules } from '@zyra/core';
import { NavigatorHeaderComponent } from '@zyra/components';
import { CategoryCount, QueryProps, TableCard, TableRow } from '@zyra/table';

import ViewCommission from './viewCommission';
import {
	dashNavigate,
	downloadCSV,
	formatCurrency,
	formatDate,
	formatLocalDate,
	formatStatusLabel,
} from '../services/commonFunction';
import { useNavigate } from 'react-router-dom';

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
		CategoryCount[] | null
	>(null);
	const [modalCommission, setModalCommission] =
		useState<CommissionRow | null>(null);
	const navigate = useNavigate();
	const { modules } = useModules();

	const rawHeaders = {
		// Everything below folds into this one info column; the plain
		// `tableDisplay: false` columns stay only for the CSV export.
		commission_title: {
			label: __('Commission', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
			csvDisplay: false,
		},
		id: {
			label: __('ID', 'multivendorx'),
			tableDisplay: false,
		},
		order_id: {
			label: __('Order', 'multivendorx'),
			tableDisplay: false,
		},
		total_order_amount: {
			label: __('Order Amount', 'multivendorx'),
			tableDisplay: false,
		},
		store_payable: {
			label: __('Total Earned', 'multivendorx'),
			tableDisplay: false,
		},
		tax_amount: {
			label: __('Tax Amount', 'multivendorx'),
			tableDisplay: false,
			condition: appLocalizer.taxes_enabled === 'yes',
		},
		shipping_tax_amount: {
			label: __('Shipping Tax', 'multivendorx'),
			tableDisplay: false,
			condition: modules.includes('store-shipping'),
		},
		shipping_amount: {
			label: __('Shipping Amount', 'multivendorx'),
			tableDisplay: false,
			condition: modules.includes('store-shipping'),
		},
		platform_fee: {
			label: __('Platform Fee', 'multivendorx'),
			tableDisplay: false,
			condition: modules.includes('marketplace-fee'),
		},
		facilitator_fee: {
			label: __('Facilitator Fee', 'multivendorx'),
			tableDisplay: false,
			condition: modules.includes('facilitator'),
		},
		gateway_fee: {
			label: __('Gateway Fee', 'multivendorx'),
			tableDisplay: false,
			condition: modules.includes('payment-gateway-charge'),
		},
		created_at: {
			label: __('Date', 'multivendorx'),
			tableDisplay: false,
		},
		status: {
			label: __('Status', 'multivendorx'),
			tableDisplay: false,
		},
		action: {
			label: __('Action', 'multivendorx'),
			type: 'action',
			actions: [
				{
					label: __('View Commission', 'multivendorx'),
					icon: 'eye',
					onClick: (row) => {
						setModalCommission(row);
					},
				},
			],
			csvDisplay: false
		},
	};

	const headers = Object.fromEntries(
		Object.entries(rawHeaders).filter(
			([_, config]) => config.condition !== false
		)
	);

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'commissions'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: buildCommissionQueryParams(query),
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
			.get(getApiLink(appLocalizer, 'commissions'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { ids: selectedIds, store_id: appLocalizer.store_id },
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
			.get(getApiLink(appLocalizer, 'commissions'), {
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

	const infoRows = rows.map((row: any) => ({
		...row,
		commission_title: `#${row.id}`,
		info_icon: 'commission',
		info_descriptions: [
			{
				label: __('Order', 'multivendorx'),
				icon: 'order',
				value: (
					<span
						className="link-item"
						onClick={() =>
							dashNavigate(navigate, [
								'orders',
								'view',
								String(row.order_id),
							])
						}
					>
						#{row.order_id}
					</span>
				),
			},
			{
				label: __('Order Amount', 'multivendorx'),
				icon: 'cart',
				value: formatCurrency(row.total_order_amount),
			},
			{
				label: __('Total Earned', 'multivendorx'),
				icon: 'wallet',
				value: formatCurrency(row.store_payable),
			},
		],
		info_badges: [
			{
				text: formatStatusLabel(row.status),
				color: `badge-${row.status}`,
			},
			{ text: formatDate(row.created_at), color: 'gray' },
		],
	}));

	return (
		<>
			<NavigatorHeaderComponent
				headerTitle={__('Commission', 'multivendorx')}
				headerDescription={__(
					'Details of commissions earned by your store for every order, including order amount, commission rate and payout status.',
					'multivendorx'
				)}
			/>

			<TableCard
				headers={headers}
				variant="transparent"
				rows={infoRows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{
					placeholder: __('Search...', 'multivendorx'),
					options: [
						{
							label: __('Commission Id', 'multivendorx'),
							value: 'commission_id',
						},
						{
							label: __('Order Id', 'multivendorx'),
							value: 'order_id',
						},
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
