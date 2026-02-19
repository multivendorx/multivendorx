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
} from 'zyra';
import ViewCommission from './ViewCommission';
import { downloadCSV, formatLocalDate } from '../../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

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
	const [selectedCommissionId, setSelectedCommissionId] = useState<number | string | null>(null);
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

	const headers = {
		id: {
			label: __('ID', 'multivendorx'),
			isSortable: true,
			csv: true,
			table: true
		},
		order_id: {
			label: __('Order', 'multivendorx'),
			isSortable: true,
			csv: true,
			table: true
		},
		total_order_amount: {
			label: __('Order Amount', 'multivendorx'),
			isSortable: true,
			type: 'currency',
			csv: true,
			table: true
		},
		commission_summary: {
			label: __('Commission Summary', 'multivendorx'),
			render: (row) => (
				<ItemList
					className="feature-list"
					items={Object.entries(row)
						.filter(([key]) =>
							['store_earning', 'shipping_amount', 'tax_amount', 'gateway_fee', 'marketplace_commission'].includes(key)
						)
						.map(([key, val]) => ({
							icon: 'adminfont-commissions',
							title: key
								.split('_')
								.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
								.join(' '),
							desc: val,
						}))
					}
				/>
			),
			csv: false,
			table: true,
		},
		store_payable: {
			label: __('Store Earning', 'multivendorx'),
			isSortable: true,
			type: 'currency',
			csv: true,
			table: true
		},
		marketplace_payable: {
			label: __('Marketplace Earning', 'multivendorx'),
			isSortable: true,
			type: 'currency',
			csv: true,
			table: true
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
			csv: true,
			table: true
		},
		created_at: {
			label: __('Date', 'multivendorx'),
			isSortable: true,
			type: 'date',
			csv: true,
			table: true
		},
		action: {
			label: __('Action', 'multivendorx'),
			type: 'action',
			csv: false,
			table: true,
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



	const downloadCommissionsCSV = (selectedIds: number[]) => {
		if (!selectedIds) return;

		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { ids: selectedIds },
			})
			.then(response => {
				const rows = response.data || [];
				downloadCSV(
					headers,
					rows,
					`selected-commissions-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch(error => {
				console.error('CSV download failed:', error);
			});
	};
	const downloadCommissionsCSVByQuery = (query: QueryProps) => {
		const params = {
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
		};

		// Call the API
		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params,
			})
			.then((response) => {
				const rows = response.data || [];

				// Prepare headers: only include csv: true
				const csvHeaders = Object.fromEntries(
					Object.entries(headers).filter(([_, h]) => h.csv !== false)
				);

				downloadCSV(
					csvHeaders,
					rows,
					`commissions-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};

	const buttonActions = [
		{
			label: __('Download CSV', 'multivendorx'),
			icon: 'download',
			onClickWithQuery: downloadCommissionsCSVByQuery
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
						onSelectCsvDownloadApply={downloadCommissionsCSV}
						format={appLocalizer.date_format}
						currency={{
							currencySymbol: appLocalizer.currency_symbol,
							priceDecimals: appLocalizer.price_decimals,
							decimalSeparator: appLocalizer.decimal_separator,
							thousandSeparator: appLocalizer.thousand_separator,
						    currencyPosition: appLocalizer.currency_position	
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