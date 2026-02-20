/*global  appLocalizer*/
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, NavigatorHeader, TableCard } from 'zyra';
import { QueryProps, TableRow } from '@/services/type';


const StoreFollower: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);

	const headers = {
		name: {
			label: __('Name', 'multivendorx'),
		},

		email: {
			label: __('Email', 'multivendorx'),
		},

		date_followed: {
			label: __('Followed On', 'multivendorx'),
			type: 'date',
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'followers'), {
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
			});
	};

	return (
		<>
			<NavigatorHeader
				headerTitle={__('Store Followers', 'multivendorx')}
				headerDescription={__('See all your store followers, engage with them, and grow your loyal customer base.', 'multivendorx')}
			/>

			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				format={appLocalizer.date_format}
			/>
		</>
	);
};

export default StoreFollower;
