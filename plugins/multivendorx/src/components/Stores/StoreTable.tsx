/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, TableCard } from 'zyra';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, formatLocalDate } from '../../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

const StoreTable: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [storeSlugMap, setStoreSlugMap] = useState<Record<number, string>>({});
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);

	const navigate = useNavigate();

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					filterStatus: query.categoryFilter === 'all' ? '' : query.categoryFilter,
					searchValue: query.searchValue || '',
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					orderBy: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const slugMap: Record<number, string> = {};

				items.forEach((store: any) => {
					if (store?.id && store?.store_slug) {
						slugMap[store.id] = store.store_slug;
					}
				});

				setStoreSlugMap(slugMap);

				const ids = items
					.filter((item: any) => item?.id != null)
					.map((item: any) => item.id);

				setRowIds(ids);
				const mappedRows: any[][] = items.map((store: any) => [
					{
						display: store.store_name,
						value: store.id,
						type: 'card',
						data: {
							name: store.store_name,
							image: store.image,
							description: `Since ${formatDate(store.applied_on)}`,
							link: `?page=multivendorx#&tab=stores&edit/${store.id}`,
							icon: 'adminfont-store-inventory'
						},
					},
					{
						display: store.email,
						value: store.email,
						type: 'card',
						data: {
							name: store.email,
							icon: 'adminfont-mail',
						}
					},
					{
						display: formatCurrency(store.commission?.commission_total),
						value: store.commission?.commission_total ?? 0,
					},
					{
						display: store.primary_owner?.data?.display_name || '—',
						value: store.primary_owner?.ID || null,
						type: 'card',
						data: {
							name: store.primary_owner?.data?.display_name,
							image: store.primary_owner?.data?.primary_owner_image,
							icon: 'adminfont-person',
							description: store.primary_owner?.data?.user_email
						}
					},
					{
						display: store.status,
						value: store.status,
					},
				]);


				setRows(mappedRows);

				setCategoryCounts([
					{
						value: 'all',
						label: 'All',
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'active',
						label: 'Active',
						count: Number(response.headers['x-wp-status-active']) || 0,
					},
					{
						value: 'under_review',
						label: 'Under Review',
						count: Number(response.headers['x-wp-status-under-review']) || 0,
					},
					{
						value: 'suspended',
						label: 'Suspended',
						count: Number(response.headers['x-wp-status-suspended']) || 0,
					},
					{
						value: 'deactivated',
						label: 'Deactivated',
						count: Number(response.headers['x-wp-status-deactivated']) || 0,
					},
				]);

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const headers = [
		{ key: 'store_name', label: 'Store', isSortable: true, },
		{ key: 'contact', label: 'Contact' },
		{ key: 'lifetime_earning', label: 'Lifetime Earning' },
		{ key: 'primary_owner', label: 'Primary Owner' },
		{ key: 'status', label: 'Status' },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Settings', 'multivendorx'),
					icon: 'setting',
					onClick: (id: number) => {
						navigate(
							`?page=multivendorx#&tab=stores&edit/${id}`
						);
					},
				},
				{
					label: __(
						'Storefront',
						'multivendorx'
					),
					icon: 'storefront',
					onClick: (id: number) => {
						const slug = storeSlugMap[id];
				
						if (!slug) {
							return;
						}
				
						window.open(
							`${appLocalizer.store_page_url}${slug}`,
							'_blank'
						);
					},
				},
			],
		},
	];
	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		}
	];
	return (
		<div className="general-wrapper">
			<div className="admin-table-wrapper">
				<TableCard
					headers={headers}
					rows={rows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={fetchData}
					ids={rowIds}
					categoryCounts={categoryCounts}
					search={{}}
					filters={filters}
					format={appLocalizer.date_format}
				/>
			</div>
		</div>
	);
};

export default StoreTable;
