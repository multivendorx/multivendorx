/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { QueryProps, TableCard, TableRow } from '@zyra/table';
import {
	formatDate,
	formatStatusLabel,
	truncateText,
} from '../services/commonFunction';

const AnnouncementsTable = (React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [isLoading, setIsLoading] = useState(false);

	const headers = {
		title: {
			label: __('Title', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
	};

	const infoRows = rows.map((row: any) => ({
		...row,
		info_icon: 'announcement',
		info_descriptions: [
			{
				label: __('Content', 'multivendorx'),
				icon: 'text',
				value: truncateText(row.content, 20) || '—',
			},
		],
		info_badges: [
			{
				text: formatStatusLabel(row.status),
				color: `badge-${row.status}`,
			},
			{ text: formatDate(row.date_created), color: 'gray' },
		],
	}));
	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'announcements'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
					withCredentials: true,
				},
				params: {
					page: query.paged,
					row: query.per_page,
					status: 'publish',
					store_id: appLocalizer?.store_id,
				},
			})
			.then((response) => {
				const items = response.data || [];
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
			<TableCard
				headers={headers}
				variant="transparent"
				rows={infoRows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				format={appLocalizer.date_format}
				showMenu={false}
			/>
		</>
	);
});

export default AnnouncementsTable;
