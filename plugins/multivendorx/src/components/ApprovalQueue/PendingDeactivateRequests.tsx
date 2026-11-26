/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { ButtonInput } from '@zyra/inputs';
import { QueryProps, TableCard, TableRow } from '@zyra/table';
import { formatDate, getUrl, truncateText } from '@/services/commonFunction';
import ListGate from '../Popup/ListGate';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { SAMPLE_DEACTIVATIONS } from '../Popup/sampleRows';

const PendingDeactivateRequests: React.FC<object> = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);

	const handleSingleAction = (action: string, storeId: number) => {
		if (!storeId) {
			return;
		}

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `stores/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { deactivate: true, action, id: storeId },
		})
			.then(() => {
				doRefreshTableData({});
			})
			.catch(console.error);
	};

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			titleLinkKey: 'info_link',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
		action: {
			label: __('Action', 'multivendorx'),
			render: (row: any) => {
				return (
					<ButtonInput
						buttons={[
							{
								icon: 'check',
								text: __('Approve', 'multivendorx'),
								color: 'purple',
								onClick: () =>
									handleSingleAction('approve', row.id),
							},
							{
								icon: 'close',
								text: __('Reject', 'multivendorx'),
								color: 'red',
								onClick: () =>
									handleSingleAction('reject', row.id),
							},
						]}
					/>
				);
			},
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'stores'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged,
					per_page: query.per_page,
					deactivate: true,
					filter_status: 'active',
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
				window.multivendorxStore?.setCount(
					'deactivate-requests',
					Number(response.headers['x-wp-total']) || 0
				);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Pending withdrawal fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	/** A record as a table row; the sample rows go through it too, so they look like real ones. */
	const toInfoRow = (row: any) => ({
		...row,
		info_icon: 'store-inventory',
		info_link: getUrl(row.id, 'store', 'edit'),
		info_descriptions: [
			{
				label: __('Reason', 'multivendorx'),
				icon: 'question',
				value: truncateText(row.reason, 20) || '—',
			},
		],
		info_badges: [{ text: formatDate(row.date), color: 'blue' }],
	});
	const infoRows = rows.map(toInfoRow);

	const sampleRowsData = SAMPLE_DEACTIVATIONS;
	const { props: gatedProps, hasNoRecords } = useNoRecordsYet({
		rows: infoRows,
		isLoading,
		onQueryUpdate: doRefreshTableData,
	});

	return (
		<ListGate
			feature={{
				title: __('Deactivation requests', 'multivendorx'),
				description: '',
				icon: 'storefront',
			}}
			sample={
				<TableCard
					headers={headers}
					variant="transparent"
					format={appLocalizer.date_format}
					rows={sampleRowsData.map(toInfoRow)}
					totalRows={sampleRowsData.length}
				/>
			}
			isEmpty={hasNoRecords}
			empty={{
				heading: __('No deactivation requests', 'multivendorx'),
				description: __(
					'When a store asks to close, the request and its reason wait here so you can approve it or follow up.',
					'multivendorx'
				),
				actions: (
					<>
						<a className="mvx-locked-button" href={'#&tab=stores'}>
							{__('View all stores', 'multivendorx')}
						</a>
					</>
				),
				note: __(
					'A preview with sample requests. Real ones show here.',
					'multivendorx'
				),
			}}
		>
			<TableCard
				headers={headers}
				variant="transparent"
				rows={infoRows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={gatedProps.onQueryUpdate}
				ids={rowIds}
				format={appLocalizer.date_format}
			/>
		</ListGate>
	);
};

export default PendingDeactivateRequests;
