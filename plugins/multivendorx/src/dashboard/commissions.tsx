/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { ExportCSV, getApiLink, NavigatorHeader, TableCard, useModules } from 'zyra';

import ViewCommission from './viewCommission';
import { formatCurrency, formatLocalDate, formatWcShortDate } from '../services/commonFunction';
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
	const [commissionById, setCommissionById] = useState<Record<number, CommissionRow>>({});
	const [modalCommission, setModalCommission] =
		useState<CommissionRow | null>(null);
	const { modules } = useModules();


	const headers = [
		{ key: 'id', label: 'ID' },
		{ key: 'order_id', label: 'Order' },
		{ key: 'order_amount', label: 'Order Amount' },
		{ key: 'commission_summary', label: 'Commission Summary' },
		{ key: 'total_earning', label: 'Total Earned' },
		{ key: 'created_at', label: 'Date', isSorting: true },
		{ key: 'status', label: 'Status' },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('View Commission', 'multivendorx'),
					icon: 'eye',
					onClick: (id: number) => {
						const com = commissionById[id];
						if (com) {
							setModalCommission(com);
						}
					},
				}
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
					searchAction: query.searchAction || 'commission_id',
					searchValue: query.searchValue || '',
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					store_id: appLocalizer.store_id,
					orderBy: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item) => item?.id != null)
					.map((item) => item.id);

				setRowIds(ids);

				const comMap: Record<number, CommissionRow> = {};
				items.forEach((com) => {
					comMap[Number(com.id)] = com;
				});

				setCommissionById(comMap);

				const mappedRows: any[][] = items.map((item: any) => [
					{
						display: (
							<span
								className="link-item"
							// onClick={() => {
							// 	setSelectedCommissionId(item.id ?? null);
							// 	setViewCommission(true);
							// }}
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
					// Order Amount
					{
						display: item.totalOrderAmount
							? formatCurrency(item.totalOrderAmount)
							: '-',
						value: item.totalOrderAmount ?? 0,
					},
					{
						display: (
							<ItemList
								className="price-list"
								items={Object.entries(ann)
									// Filter only the commission keys you want to show
									.filter(([key]) => [
										'storeEarning',
										'shippingAmount',
										'taxAmount',
										'gatewayFee',
										'marketplaceCommission'
									].includes(key))
									.map(([key, val]) => ({
										title: key.replace(/([A-Z])/g, ' $1').trim(), // Formats 'storeEarning' to 'Store Earning'
										value: val // This is your commission value (e.g. "112.00")
									}))
								}
							/>
						),
						value: item.id
					},
					// Store Earning
					{
						display: formatCurrency(item.storePayable),
						value: item.storePayable ?? 0,
					},

					// Marketplace Earning
					{
						display: formatCurrency(item.marketplacePayable),
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
							? formatWcShortDate(item.createdAt)
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
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const commissionColumns = (commission: CommissionRow) => ({
		[__('ID', 'multivendorx')]: commission.id ?? '',

		[__('Order', 'multivendorx')]: commission.orderId ?? '',

		[__('Order Amount', 'multivendorx')]:
			commission.totalOrderAmount ?? '',

		[__('Commission Summary', 'multivendorx')]:
			commission.storeEarning ?? '',

		[__('Total Earned', 'multivendorx')]:
			commission.storePayable ?? '',

		[__('Status', 'multivendorx')]:
			commission.status ?? '',

		[__('Date', 'multivendorx')]:
			commission.createdAt ?? '',
	});

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
							? `commissions-${formatLocalDate(
								query.filter.created_at.startDate
							)}-${formatLocalDate(
								query.filter.created_at.endDate
							)}.csv`
							: `commissions-${formatLocalDate(new Date())}.csv`,

					paramsBuilder: {
						page: 1,
						row: 100,
						status:
							query.categoryFilter === 'all'
								? ''
								: query.categoryFilter,
						searchValue: query.searchValue || '',
						startDate: query.filter?.created_at?.startDate
							? formatLocalDate(
								query.filter.created_at.startDate
							)
							: '',
						endDate: query.filter?.created_at?.endDate
							? formatLocalDate(
								query.filter.created_at.endDate
							)
							: '',
						store_id: appLocalizer.store_id,
						orderBy: query.orderby,
						order: query.order,
					},

					columns: commissionColumns,
				}),
		},
	];

	return (
		<>
			<NavigatorHeader
				headerTitle={__('Commission', 'multivendorx')}
				headerDescription={__( 'Details of commissions earned by your store for every order, including order amount, commission rate and payout status.', 'multivendorx')}
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
				onQueryUpdate={fetchData}
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
				onSelectCsvDownloadApply={(selectedIds: number[]) =>
					ExportCSV({
						url: getApiLink(appLocalizer, 'commission'),
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
						filename: `selected-commissions-${formatLocalDate(new Date())}.csv`,
						paramsBuilder: { ids: selectedIds },
						columns: commissionColumns,
					})
				}
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
