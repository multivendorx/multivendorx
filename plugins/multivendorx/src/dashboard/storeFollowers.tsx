/*global  appLocalizer*/
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { NavigatorHeaderComponent } from '@zyra/components';
import { QueryProps, TableCard, TableRow } from '@zyra/table';
import { formatDate } from '../services/commonFunction';

const StoreFollower: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);

	const headers = {
		name: {
			label: __('Name', 'multivendorx'),
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
				label: __('Email', 'multivendorx'),
				icon: 'mail',
				value: row.email || '—',
			},
		],
		info_badges: [
			{ text: formatDate(row.date_followed), color: 'gray' },
		],
	}));

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'follow-stores'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					store_id: appLocalizer.store_id,
					page: query.paged || 1,
					row: query.per_page || 10,
				},
			})
			.then((response) => {
				const items = response.data || [];
				setRows(items);

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
				console.error(error);
			});
	};

	return (
		<>
			<NavigatorHeaderComponent
				headerTitle={__('Store Followers', 'multivendorx')}
				headerDescription={__(
					'See all your store followers, engage with them, and grow your loyal customer base.',
					'multivendorx'
				)}
			/>

			<TableCard
				headers={headers}
				variant="transparent"
				rows={infoRows}
				totalRows={totalRows}
				isLoading={isLoading}
				showMenu={false}
				onQueryUpdate={doRefreshTableData}
				format={appLocalizer.date_format}
			/>
		</>
	);
};

export default StoreFollower;
