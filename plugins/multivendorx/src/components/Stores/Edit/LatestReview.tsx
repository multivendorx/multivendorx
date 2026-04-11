/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { QueryProps, TableCard, TableRow, getApiLink } from 'zyra';

interface LatestReviewProps {
	store_id?: number;
}

const LatestReview: React.FC<LatestReviewProps> = ({ store_id }) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const doRefreshTableData = (query: QueryProps) => {
		if (!store_id) {
			return;
		}
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'review'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: 3,
					store_id: store_id,
					order_by: 'date_created',
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
		customer_name: {
			label: __('Customer', 'multivendorx'),
		},
		overall_rating: {
			label: __('Rating', 'multivendorx'),
		},
		review_content: {
			label: __('Content', 'multivendorx'),
		},
		date_created: {
			label: __('Date', 'multivendorx'),
			type: 'date'
		},
	};

	return (
		<TableCard
			headers={headers}
			rows={rows}
			isLoading={isLoading}
			onQueryUpdate={doRefreshTableData}
			showMenu={false}
			format={appLocalizer.date_format}
		/>
	);
};

export default LatestReview;
