/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {ExportCSV, getApiLink,TableCard,useModules} from 'zyra';

import ViewCommission from './viewCommission';
import { formatCurrency, formatLocalDate, formatWordpressDate } from '../services/commonFunction';
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
	const [expandedRows, setExpandedRows] = useState<{
		[key: number]: boolean;
	}>({});


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
								{formatCurrency(ann.currency_symbol, ann.storeEarning)}
							</div>
						</div>
					</li>
				)}

				{modules.includes('store-shipping') && ann?.shippingAmount && (
					<li>
						<div className="item">
							<div className="des">Shipping</div>
							<div className="title">
								+ {formatCurrency(ann.currency_symbol, ann.shippingAmount)}
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
									+ {formatCurrency(ann.currency_symbol, ann.taxAmount)}
								</div>
							</div>
						</li>
					)}

				{ann?.shippingTaxAmount && (
					<li>
						<div className="item">
							<div className="des">Shipping Tax</div>
							<div className="title">
								+ {formatCurrency(ann.currency_symbol, ann.shippingTaxAmount)}
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
											- {formatCurrency(ann.currency_symbol, ann.gatewayFee)}
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
											{formatCurrency(ann.currency_symbol, ann.facilitatorFee)}
										</div>
									</div>
								)}

							{modules.includes('marketplace-fee') &&
								ann?.platformFee && (
									<div className="item">
										<div className="des">Platform Fee</div>
										<div className="title">
											-{' '}
											{formatCurrency(ann.currency_symbol, ann.platformFee)}
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
					.filter((ann: any) => ann?.id != null)
					.map((ann: any) => ann.id);

				setRowIds(ids);

				const comMap: Record<number, CommissionRow> = {};
				items.forEach((com: any) => {
					comMap[Number(com.id)] = com;
				});

				setCommissionById(comMap);

				const mappedRows: any[][] = items.map((ann: any) => [
					{
						display: (
							<span
								className="link-item"
								// onClick={() => {
								// 	setSelectedCommissionId(ann.id ?? null);
								// 	setViewCommission(true);
								// }}
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
								href={`/dashboard/sales/orders/#view/${ann.orderId}`}
								target="_blank"
								rel="noopener noreferrer"
								className="link-item"
							>
								#{ann.orderId}
							</a>
						) : (
							'-'
						),
						value: ann.orderId ?? '',
					},
					// Order Amount
					{
						display: ann.totalOrderAmount
							? formatCurrency(ann.currency_symbol, ann.totalOrderAmount)
							: '-',
						value: ann.totalOrderAmount ?? 0,
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
					// Store Earning
					{
						display: formatCurrency(ann.currency_symbol, ann.storePayable),
						value: ann.storePayable ?? 0,
					},

					// Marketplace Earning
					{
						display: formatCurrency(ann.currency_symbol, ann.marketplacePayable),
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
							? formatWordpressDate(ann.createdAt)
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
						// onClick={handleExportAll}
					>
						<i className="adminfont-export"></i>
						{__('Export', 'multivendorx')}
					</button>
				</div>
			</div>
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
