/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, NoticeManager, QueryProps, TableCard, TableRow } from 'zyra';

const NotificationsTable = (React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'notifications'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					notification: true,
					store_id: appLocalizer?.store_id,
				},
			})
			.then((response) => {
				const items = response.data || [];
				setRows(items);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				NoticeManager.add({
					title: __('Error', 'multivendorx'),
					message: __('Failed to load announcements', 'multivendorx'),
					type: 'error',
					position: 'float',
				});
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
				console.error(error);
			});
	};

	const headers = {
		title: {
			label: __('Title', 'multivendorx'),
		},
		type: {
			label: __('Type', 'multivendorx'),
		},
		date: {
			label: __('Date', 'multivendorx'),
			type: 'date',
		},
	};
	return (
		<TableCard
			headers={headers}
			rows={rows}
			totalRows={totalRows}
			isLoading={isLoading}
			onQueryUpdate={doRefreshTableData}
			showMenu={false}
		/>
	);
});

export default NotificationsTable;
