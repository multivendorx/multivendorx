import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, Container, Column, TableCard } from 'zyra';
import { QueryProps, TableRow } from '@/services/type';

const NotificationTable = (React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'notifications'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					notification: true,
				},
			})
			.then((response) => {
				const items = response.data || [];

				setRows(items);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch announcements', error);
				setError(__('Failed to load announcements', 'multivendorx'));
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const headers = {
		store_name: {
			label: __('Store Name', 'multivendorx'),
		},
		title: {
			label: __('Title', 'multivendorx'),
		},
		type: {
			label: __('Type', 'multivendorx'),
		},
		date: {
			label: __('Date', 'multivendorx'),
			type:'date'
		},
	};

	return (
		<Container general>
			<Column>
				{error && <div className="error-notice">{error}</div>}
				<TableCard
					headers={headers}
					rows={rows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={doRefreshTableData}
					format={appLocalizer.date_format}
				/>
			</Column>
		</Container>
	);
});

export default NotificationTable;
