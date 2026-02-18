import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, TableCard } from 'zyra';

import { QueryProps, TableRow } from '@/services/type';

const ActivitiesTable = (React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const headers = [
		{
			key: 'title',
			label: 'Title',
		},
		{
			key: 'type',
			label: 'Type',
		},
		{
			key: 'date',
			label: 'Date',
		}
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'notifications'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					store_id: appLocalizer?.store_id,
				},
			})
			.then((response) => {
				const items = response.data || [];

				const mappedRows: any[][] = items.map((item: any) => [
					{ display: item.title, value: item.title },
					{ display: item.type, value: item.type },
					{ display: item.date, value: item.date }
				]);

				setRows(mappedRows);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch(() => {
				setError(__('Failed to load activities', 'multivendorx'));
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<>
			{error && <div className="error-notice">{error}</div>}
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={fetchData}
			/>
		</>
	);
});

export default ActivitiesTable;
