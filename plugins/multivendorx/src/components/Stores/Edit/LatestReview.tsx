/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { QueryProps, TableCard, TableRow } from '@zyra/table';
import { formatDate } from '@/services/commonFunction';

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
			.get(getApiLink(appLocalizer, 'reviews'), {
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
			type: 'info',
			iconKey: 'info_icon',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
	};

	const infoRows = rows.map((row: any) => ({
		...row,
		info_icon: 'person',
		info_descriptions: [
			{
				label: __('Rating', 'multivendorx'),
				icon: 'store-review',
				value: row.overall_rating ?? '—',
			},
			{
				label: __('Content', 'multivendorx'),
				icon: 'text',
				value: row.review_content || '—',
			},
		],
		info_badges: [{ text: formatDate(row.date_created), color: 'gray' }],
	}));

	return (
		<TableCard
			headers={headers}
			variant="transparent"
			rows={infoRows}
			isLoading={isLoading}
			onQueryUpdate={doRefreshTableData}
			showMenu={false}
			format={appLocalizer.date_format}
		/>
	);
};

export default LatestReview;
