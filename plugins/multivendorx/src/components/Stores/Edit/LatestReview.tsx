/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {  TableCard, getApiLink } from 'zyra';
import { QueryProps, TableHeader, TableRow } from '@/services/type';

interface LatestReviewProps {
	store_id?: number;
}

const LatestReview: React.FC<LatestReviewProps> = ({ store_id }) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const doRefreshTableData = (query: QueryProps) => {
		if(!store_id) return;
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'review'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: 3,
					store_id: store_id,
					orderBy: 'date_created',
					order: 'desc',
				},
			})
			.then((response) => {
				const items = response.data || [];

				const mappedRows: any[][] = items.map((item: any) => [
					{
						type: 'card',
						display: item.store_name,
						value: item.store_name,
						data: {
							name: item.customer_name,
							link: `${window.location.origin}/wp-admin/user-edit.php?user_id=${item.customer_id}`
						}
					},
					{
						type: 'card',
						display: item.overall_rating,
						value: item.overall_rating,
						data: {
							name: item.overall_rating,
							description:item.review_content
						}
					},
					{ display: item.date_created, value: item.date_created }
				]);

				setRows(mappedRows);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch announcements', error);
				setRows([]);
				setIsLoading(false);
			});
	};


	const headers: TableHeader[] = [
		{
			key: 'customer',
			label: 'Customer',
		},
		{
			key: 'details',
			label: 'Details',
		},
		{
			key: 'date',
			label: 'Date',
		}
	];

	return (
		<TableCard
			headers={headers}
			rows={rows}
			isLoading={isLoading}
			onQueryUpdate={doRefreshTableData}
		/>
	);
};

export default LatestReview;
