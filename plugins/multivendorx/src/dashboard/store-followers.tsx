/*global  appLocalizer*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, Table, TableCell } from 'zyra';
import { formatTimeAgo } from '@/services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';


const StoreFollower: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);

	const headers = [
		{ key: 'name', label: 'Name' },
		{ key: 'email', label: 'Email' },
		{ key: 'date', label: 'Followed On' }
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'follow-store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					store_id: appLocalizer.store_id,
					page: query.paged || 1,
					row:query.per_page || 10,
				},
			})
			.then((response) => {
				const items = response.data || [];

				const mappedRows: any[][] = items.map((fol: any) => [
					{ display: fol.name, value:  fol.name },
					{ display: fol.email, value:  fol.email },
					{ display: formatTimeAgo(fol.date), value:  fol.date },
				]);

				setRows(mappedRows);

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
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Store Followers', 'multivendorx')}
					</div>
					<div className="des">
						{__(
							'See all your store followers, engage with them, and grow your loyal customer base.',
							'multivendorx'
						)}
					</div>
				</div>
			</div>

			<div className="admin-table-wrapper">
				<TableCard
					headers={headers}
					rows={rows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={fetchData}
				/>
			</div>
		</>
	);
};

export default StoreFollower;
