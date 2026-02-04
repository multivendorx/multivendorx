/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, ProPopup, Container, Column, TableCard } from 'zyra';
import { Dialog } from '@mui/material';
import { formatLocalDate, formatWcShortDate } from '@/services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

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
		if (!deleteId) return;
	
		axios
			.delete(getApiLink(appLocalizer, `report-abuse/${deleteId}`), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then(() => {
				fetchData({});
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
				const options =
					(response.data || []).map((store: any) => ({
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

	const headers = [
		{ key: 'product', label: __('Product', 'multivendorx') },
		{ key: 'email', label: __('Reported By', 'multivendorx') },
		{ key: 'reason', label: __('Reason', 'multivendorx') },
		{ key: 'created_at', label: __('Date created', 'multivendorx'), isSortable: true, },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Delete', 'multivendorx'),
					icon: 'delete',
					onClick: (id: number) => {
						setDeleteId(id);
						setConfirmOpen(true);
					},
				},
			],			
		},
	];

	const filters = [
		{
			key: 'store_id',
			label: 'Stores',
			type: 'select',
			options: store,
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'report-abuse'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					page: query.paged,
					per_page: query.per_page,
					orderby: query.orderby,
					order: query.order,
					store_id: query?.filter?.store_id,
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
				},
			})
			.then((response) => {
				const products = Array.isArray(response.data)
					? response.data
					: [];

				const ids = products.map((p: any) => p.id);
				setRowIds(ids);

				const mappedRows: any[][] = products.map((product: any) => [
					{
						type: 'product',
						value: product.product_id,
						display: product.name,
						data: {
							id: product.product_id,
							name: product.product_name,
							sku: product.product_sku,
							image: product.product_image || '',
							link: `${window.location.origin}/wp-admin/post.php?post=${product.product_id}&action=edit`,
						},
					},
					{
						display: product.email,
						value: product.email,
					},
					{
						display: product.reason,
						value: product.reason,
					},
					{
						display: product.created_at
							? formatWcShortDate(product.created_at)
							: '-',
						value: product.created_at,
					}
				]);

				setRows(mappedRows);
				setTotalRows(
					Number(response.headers['x-wp-total']) || 0
				);
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
						onQueryUpdate={fetchData}
						ids={rowIds}
						filters={filters}
					/>
				</Column>
			</Container>
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
				<ProPopup
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
			</Dialog>
		</>
	);
};

export default PendingReportAbuse;
