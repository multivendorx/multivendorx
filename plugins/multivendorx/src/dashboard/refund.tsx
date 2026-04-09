/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	InfoItem,
	NavigatorHeader,
	QueryProps,
	TableCard,
	TableRow,
} from 'zyra';

import { dashNavigate, formatLocalDate } from '@/services/commonFunction';
import { useNavigate } from 'react-router-dom';

const Refund: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const navigate = useNavigate();
	const privacy =
		appLocalizer.settings_databases_value?.privacy?.[
			'customer_information_access'
		];
	const privacyHeaders = privacy?.includes('name')
		? {
				customer_name: {
					label: __('Customer', 'multivendorx'),
					width: 18,
					render: (row) => {
						return (
							<InfoItem
								title={row.customer_name}
								// titleLink={getUrl(row.id, 'product') || ''}
								avatar={{
									image: row.images?.[0]?.src || '',
									iconClass: row.images?.[0]?.src
										? ''
										: 'person',
								}}
								descriptions={[
									{
										label: __('Email', 'multivendorx'),
										value: row.email || '—',
									}
								]}
							/>
						);
					},
				},
			}
		: {};

	const headers = {
		order_id: {
			label: __('Order', 'multivendorx'),
			isSortable: true,
			render: (row) => (
				<span
					className='link-item'
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

		...privacyHeaders,

		amount: {
			label: __('Refund Amount', 'multivendorx'),
			type: 'currency',
		},

		customer_reason: {
			label: __('Refund Reason', 'multivendorx'),
		},

		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},

		date_created: {
			label: __('Date', 'multivendorx'),
			type: 'date',
			isSortable: true,
		},
	};
	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'refund'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter || '',
					search_action: query.searchAction || 'order_id',
					search_value: query.searchValue || '',
					store_id: appLocalizer.store_id,
					start_date: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					end_date: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					order_by: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item) => item?.review_id != null)
					.map((item) => item.review_id);

				setRowIds(ids);

				setRows(items);

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch(() => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<>
			<NavigatorHeader
				headerTitle={__('Refund', 'multivendorx')}
				headerDescription={__(
					'Manage and process refund requests from customers.',
					'multivendorx'
				)}
			/>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				search={{
					placeholder: 'Search...',
					size: 8,
					options: [
						{ label: __('Order Id', 'multivendorx'), value: 'order_id' },
    					{ label: __('Customer', 'multivendorx'), value: 'customer' },
					],
				}}
				filters={filters}
				format={appLocalizer.date_format}
				currency={{
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position,
				}}
			/>
		</>
	);
};

export default Refund;
