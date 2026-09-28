/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { NoticeManager } from '@zyra/components';
import { QueryProps, TableCard, TableRow } from '@zyra/table';
import { formatDate } from '../services/commonFunction';

const ActivitiesTable = (React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const headers = {
		title: {
			label: __('Title', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			badgesKey: 'info_badges',
		},
	};

	const infoRows = rows.map((row: any) => ({
		...row,
		info_icon: 'notification',
		info_badges: [{ text: formatDate(row.date), color: 'gray' }],
	}));

	const doRefreshTableData = (query: QueryProps) => {
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
				setRows(items);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch(() => {
				NoticeManager.add({
					title: __('Error', 'multivendorx'),
					message: __('Failed to load activities', 'multivendorx'),
					type: 'error',
					position: 'float',
				});
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<TableCard
			headers={headers}
			variant="transparent"
			rows={infoRows}
			totalRows={totalRows}
			isLoading={isLoading}
			onQueryUpdate={doRefreshTableData}
			showMenu={false}
		/>
	);
});

export default ActivitiesTable;
