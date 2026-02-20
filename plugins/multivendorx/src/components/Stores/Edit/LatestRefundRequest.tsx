/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, TableCard } from 'zyra';
import { QueryProps, TableRow } from '@/services/type';

interface LatestRefundRequestProps {
	store_id: number;
}

const LatestRefundRequest: React.FC<LatestRefundRequestProps> = ({
	store_id,
}) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const doRefreshTableData = (query: QueryProps) => {
		if (!store_id) return;
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'refund'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: 3,
					store_id: store_id,
					order_by: 'date',
					order: 'desc',
				},
			})
			.then((response) => {
				const items = response.data || [];

				setRows(items);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch announcements', error);
				setRows([]);
				setIsLoading(false);
			});
	};

	const headers = {
		order_id: {
			label: __('Order', 'multivendorx'),
		},
		customer_name: {
			label: __('Customer', 'multivendorx'),
		},
		amount: {
			label: __('Refund Amount', 'multivendorx'),
		},
		reason: {
			label: __('Refund Reason', 'multivendorx'),
		},
		status: {
			label: __('Status', 'multivendorx'),
		},
		date_created: {
			label: __('Date', 'multivendorx'),
		},
	};

	return <>

		<TableCard
			headers={headers}
			rows={rows}
			isLoading={isLoading}
			onQueryUpdate={doRefreshTableData}
		/>
	</>
};

export default LatestRefundRequest;
