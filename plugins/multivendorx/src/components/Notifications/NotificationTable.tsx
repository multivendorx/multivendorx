/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	Container,
	Column,
	TableCard,
	TableRow,
	QueryProps,
	InfoItem,
	NoticeManager,
} from 'zyra';
import { getUrl } from '@/services/commonFunction';

const NotificationTable = (React.FC = () => {
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
				NoticeManager.add({
					title: __('Error', 'multivendorx'),
					message: __('Failed to load notifications', 'multivendorx'),
					type: 'error',
					position: 'float',
				});
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
			render: (row) => (
				<InfoItem
					title={row.store_name}
					titleLink={getUrl(row.store_id, 'store', 'edit')}
					avatar={{
						iconClass: 'store-inventory',
					}}
				/>
			),
		},
		title: {
			label: __('Title', 'multivendorx'),
		},
		type: {
			label: __('Type', 'multivendorx'),
			type: 'status',
		},
		created_at: {
			label: __('Date', 'multivendorx'),
			type: 'date',
		},
	};

	return (
		<Container>
			<Column>
				<TableCard
					headers={headers}
					rows={rows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={doRefreshTableData}
					format={appLocalizer.date_format}
					showMenu={false}
				/>
			</Column>
		</Container>
	);
});

export default NotificationTable;
