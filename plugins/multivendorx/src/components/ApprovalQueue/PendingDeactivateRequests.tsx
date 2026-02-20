/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, TableCard } from 'zyra';
import { QueryProps, TableRow } from '@/services/type';

interface Props {
	onUpdated?: () => void;
}

const PendingDeactivateRequests: React.FC<Props> = ({ onUpdated }) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);

	const handleSingleAction = (action: string, storeId: number) => {
		if (!storeId) {
			return;
		}

		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { deactivate: true, action, id: storeId },
		})
			.then(() => {
				doRefreshTableData({});
				onUpdated?.();
			})
			.catch(console.error);
	};

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
		},
		reason: {
			label: __('Reason', 'multivendorx'),
		},
		date: {
			label: __('Date', 'multivendorx'),
			isSortable: true,
			type: 'date',
		},
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Approve', 'multivendorx'),
					icon: 'check',
					onClick: (row: any) => handleSingleAction('approve', row),
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					className: 'danger',
					onClick: (row: any) => handleSingleAction('reject', row),
				},
			],
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged,
					per_page: query.per_page,
					deactivate: true,
				},
			})
			.then((response) => {
				const stores = Array.isArray(response.data)
					? response.data
					: [];

				const ids = stores.map((s) => s.id);
				setRowIds(ids);

				setRows(stores);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Pending withdrawal fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<>
			<div className="admin-table-wrapper">
				<TableCard
					headers={headers}
					rows={rows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={doRefreshTableData}
					ids={rowIds}
					format={appLocalizer.date_format}
				/>
			</div>
		</>
	);
};

export default PendingDeactivateRequests;
