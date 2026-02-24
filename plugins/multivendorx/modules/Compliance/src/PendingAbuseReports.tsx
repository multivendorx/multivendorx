/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, Container, Column, TableCard, PopupUI } from 'zyra';
import { QueryProps, TableRow } from '@/services/type';
import Popup from '../../../src/components/Popup/Popup';

interface Props {
	onUpdated?: () => void;
}

const PendingReportAbuse: React.FC<Props> = ({ onUpdated }) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [store, setStore] = useState<any[] | null>(null);

	const handleConfirmDelete = () => {
		if (!deleteId) {
			return;
		}

		axios
			.delete(getApiLink(appLocalizer, `report-abuse/${deleteId}`), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then(() => {
				doRefreshTableData({});
				onUpdated?.();
			})
			.catch(() => {
				alert(__('Failed to delete report', 'multivendorx'));
			})
			.finally(() => {
				setConfirmOpen(false);
				setDeleteId(null);
			});
	};

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const options = (response.data || []).map((store: any) => ({
					label: store.store_name,
					value: store.id,
				}));

				options.unshift({
					label: __('Admin', 'multivendorx'),
					value: 0,
				});

				setStore(options);
				setIsLoading(false);
			})
			.catch(() => {
				setStore([]);
				setIsLoading(false);
			});
	}, []);

	const headers = {
		product: {
			label: __('Product', 'multivendorx'),
		},
		email: {
			label: __('Reported By', 'multivendorx'),
		},
		reason: {
			label: __('Reason', 'multivendorx'),
		},
		created_at: {
			label: __('Date created', 'multivendorx'),
			isSortable: true,
			type: 'date',
		},
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Delete', 'multivendorx'),
					icon: 'delete',
					onClick: (row: any) => {
						setDeleteId(row.id);
						setConfirmOpen(true);
					},
				},
			],
		},
	};

const filters = [
	{
		key: 'store_id',
		label: __('Stores', 'multivendorx'),
		type: 'select',
		options: store,
	},
	{
		key: 'created_at',
		label: __('Created Date', 'multivendorx'),
		type: 'date',
	},
];

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'report-abuse'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					page: query.paged,
					per_page: query.per_page,
					order_by: query.orderby,
					order: query.order,
					store_id: query?.filter?.store_id,
					start_date: query.filter?.created_at?.startDate
						? query.filter.created_at.startDate
						: '',
					end_date: query.filter?.created_at?.endDate
						? query.filter.created_at.endDate
						: '',
				},
			})
			.then((response) => {
				const products = Array.isArray(response.data)
					? response.data
					: [];

				const ids = products.map((p: any) => p.id);
				setRowIds(ids);

				setRows(products);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Product fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<>
			<Container>
				<Column>
					<TableCard
						headers={headers}
						rows={rows}
						totalRows={totalRows}
						isLoading={isLoading}
						onQueryUpdate={doRefreshTableData}
						ids={rowIds}
						filters={filters}
						format={appLocalizer.date_format}
					/>
				</Column>
			</Container>
			<PopupUI
				position="lightbox"
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				width={31.25}
			>
				<Popup
					confirmMode
					title={__('Are you sure?', 'multivendorx')}
					confirmMessage={__(
						'Are you sure you want to delete this abuse report?',
						'multivendorx'
					)}
					confirmYesText={__('Delete', 'multivendorx')}
					confirmNoText={__('Cancel', 'multivendorx')}
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
					}}
				/>
			</PopupUI>
		</>
	);
};

export default PendingReportAbuse;
