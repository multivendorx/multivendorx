import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import {
	useModules,
	getApiLink,
	TableCard,
	NavigatorHeader,
	TableRow,
	QueryProps,
	CategoryCount,
} from 'zyra';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toWcIsoDate } from '../services/commonFunction';
import { applyFilters } from '@wordpress/hooks';

const buildPath = (segments: string[]): string =>
	`/${segments.filter(Boolean).join('/')}`;

const sanitize = (value: string) =>
	value.replace(/[^a-zA-Z0-9_-]/g, '');

const updatePlainPermalinkUrl = (segments: string[]) => {
	const [segment = '', element = '', context_id = ''] = segments;

	const params = new URLSearchParams({
		page_id: appLocalizer.dashboard_page_id,
		segment: sanitize(segment),
		...(element ? { element: sanitize(element) } : {}),
		...(context_id ? { context_id: sanitize(context_id) } : {}),
	});

	window.history.pushState(
		{},
		'',
		`${window.location.pathname}?${params.toString()}`
	);
};

const STATUS_LABELS: Record<string, string> = {
	all:     __('All',       'multivendorx'),
	publish: __('Published', 'multivendorx'),
	draft:   __('Draft',     'multivendorx'),
	pending: __('Pending',   'multivendorx'),
	private: __('Private',   'multivendorx'),
	trash:   __('Trash',     'multivendorx'),
};

const AllProduct: React.FC = () => {
	const [rows, setRows]                         = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading]               = useState(false);
	const [totalRows, setTotalRows]               = useState<number>(0);
	const [rowIds, setRowIds]                     = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts]     = useState<CategoryCount[] | null>(null);
	const [categoriesList, setCategoriesList]     = useState<{ id: number; name: string }[]>([]);
	const [newProductId, setNewProductId]         = useState<number | null>(null);

	const { modules } = useModules();
	const navigate    = useNavigate();

	// dashNavigate — single helper for all navigation (pretty + plain)
	const dashNavigate = (segments: string[]) => {
		const path = buildPath(segments);
		if (!appLocalizer.permalink_structure) {
			updatePlainPermalinkUrl(segments);
		}
		navigate(path);
	};

	const createAutoDraftProduct = () => {
		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/products/`,
				{ name: 'Auto Draft', status: 'draft' },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then((res) => setNewProductId(res.data.id))
			.catch((err) => console.error('Error creating auto draft product:', err));
	};

	useEffect(() => {
		if (!newProductId) return;
		dashNavigate(['products', 'edit', String(newProductId)]);
	}, [newProductId]);

	const fetchCategories = async () => {
		try {
			const response = await axios.get(
				`${appLocalizer.apiUrl}/wc/v3/products/categories`,
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			);
			setCategoriesList(response.data);
		} catch {}
	};

	const fetchProductStatusCounts = async () => {
		try {
			const statuses = ['all', 'publish', 'draft', 'pending', 'private', 'trash'];

			const results = await Promise.allSettled(
				statuses.map(async (status) => {
					const params: any = {
						per_page: 1,
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					};
					if (status !== 'all') params.status = status;

					const res = await axios.get(
						`${appLocalizer.apiUrl}/wc/v3/products`,
						{ headers: { 'X-WP-Nonce': appLocalizer.nonce }, params }
					);

					return {
						value: status,
						label: STATUS_LABELS[status],
						count: parseInt(res.headers['x-wp-total'] || '0'),
					};
				})
			);

			setCategoryCounts(
				results.map((result, index) =>
					result.status === 'fulfilled'
						? result.value
						: { value: statuses[index], label: STATUS_LABELS[statuses[index]], count: 0 }
				)
			);
		} catch (error) {
			console.error('Error fetching product status counts:', error);
		}
	};

	const fetchWpmlTranslations = () => {
		if (!modules.includes('wpml')) return;

		axios
			.get(getApiLink(appLocalizer, 'multivendorx-wpml'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const langs = response.data || [];
				if (langs.length) fetchLanguageWiseProductCounts(langs);
			})
			.catch((err) => console.error('Error fetching WPML translations:', err));
	};

	const fetchLanguageWiseProductCounts = async (langs: any[]) => {
		if (!langs?.length) return;

		const fetchCount = async (lang: any) => {
			try {
				const res = await axios.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						per_page: 1,
						lang: lang.code,
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					},
				});
				return parseInt(res.headers['x-wp-total'] || '0');
			} catch {
				return 0;
			}
		};

		const counts = await Promise.all(
			langs.map(async (lang) => ({
				value: lang.code,
				label: lang.name,
				count: await fetchCount(lang),
			}))
		);

		const languageItems = counts.filter((l) => l.count > 0);
		if (!languageItems.length) return;

		const totalCount = languageItems.reduce((sum, l) => sum + l.count, 0);

		setCategoryCounts((prev) => [
			...(prev || []).filter(
				(item) =>
					item.value !== 'all_lang' &&
					!langs.some((lang) => lang.code === item.value)
			),
			{
				value: 'all_lang',
				label: __('All Languages', 'multivendorx'),
				count: totalCount,
			},
			...languageItems,
		]);
	};

	useEffect(() => {
		fetchCategories();
		fetchProductStatusCounts();
		fetchWpmlTranslations();
	}, []);

	const handleDelete = async (productId: number) => {
		await axios.delete(`${appLocalizer.apiUrl}/wc/v3/products/${productId}`, {
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		});
		doRefreshTableData({});
	};

	const handleBulkAction = (action: string, selectedIds: []) => {
		if (action !== 'delete') return;

		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/products/batch`,
				{ delete: selectedIds },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				fetchCategories();
				fetchProductStatusCounts();
				fetchWpmlTranslations();
				doRefreshTableData({});
			})
			.catch((err: unknown) => console.error('Error performing bulk product action:', err));
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page:         query.paged      || 1,
					row:          query.per_page   || 10,
					search:       query.searchValue || '',
					type:         query.filter?.productType,
					category:     query.filter?.category,
					stock_status: query.filter?.stockStatus,
					after:  query.filter?.created_at?.startDate
						? toWcIsoDate(query.filter.created_at.startDate, 'start')
						: undefined,
					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
					meta_key: 'multivendorx_store_id',
					value:    appLocalizer.store_id,
				},
			})
			.then((response) => {
				const items = response.data || [];
				setRowIds(items.filter((i: any) => i?.id != null).map((i: any) => i.id));
				setRows(items);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch(() => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const bulkActions = [{ label: 'Delete', value: 'delete' }];

	const filters = [
		{
			key: 'category',
			type: 'select',
			label: __('Category', 'multivendorx'),
			options: categoriesList.map((cat) => ({ value: cat.id, label: cat.name })),
		},
		{
			key: 'productType',
			type: 'select',
			label: __('Product Type', 'multivendorx'),
			options: [
				{ value: 'simple',   label: __('Simple Product',            'multivendorx') },
				{ value: 'variable', label: __('Variable Product',           'multivendorx') },
				{ value: 'grouped',  label: __('Grouped Product',            'multivendorx') },
				{ value: 'external', label: __('External/Affiliate Product', 'multivendorx') },
			],
		},
		{
			key: 'stock_status',
			type: 'select',
			label: __('Stock Status', 'multivendorx'),
			options: [
				{ value: 'instock',     label: __('In Stock',      'multivendorx') },
				{ value: 'outofstock',  label: __('Out of Stock',  'multivendorx') },
				{ value: 'onbackorder', label: __('On Backorder',  'multivendorx') },
			],
		},
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	const headers = {
		name: {
			label: __('Product Name', 'multivendorx'),
		},
		price: {
			label: __('Price', 'multivendorx'),
			type: 'currency',
		},
		stock_status: {
			label: __('Stock', 'multivendorx'),
			render: (row: any) =>
				row.stock_status === 'instock'
					? __('In stock',     'multivendorx')
					: row.stock_status === 'outofstock'
					? __('Out of stock', 'multivendorx')
					: row.stock_status,
		},
		categories: {
			label: __('Categories', 'multivendorx'),
			render: (row: any) =>
				Array.isArray(row.categories) && row.categories.length
					? row.categories.map((c: any) => c.name).join(', ')
					: __('-', 'multivendorx'),
		},
		date_created: {
			label: __('Date', 'multivendorx'),
			type: 'date',
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (row: any) => dashNavigate(['products', 'edit', String(row.id)]),
				},
				{
					label: __('View', 'multivendorx'),
					icon: 'eye',
					onClick: (row: any) => window.location.assign(row.permalink),
				},
				{
					label: __('Copy URL', 'multivendorx'),
					icon: 'copy',
					onClick: (row: any) => navigator.clipboard.writeText(row.permalink).catch(() => {}),
				},
				{
					label: __('Delete', 'multivendorx'),
					icon: 'adminfont-delete delete',
					onClick: (row: any) => handleDelete(row.id),
				},
			],
		},
	};

	return (
		<>
			<NavigatorHeader
				headerTitle={__('All Products', 'multivendorx')}
				headerDescription={__('Manage your store products', 'multivendorx')}
				buttons={[
					...(modules.includes('import-export')
						? [{ custom: applyFilters('product_import_export', null) }]
						: []),
					{
						label: __('Add New', 'multivendorx'),
						icon: 'plus',
						onClick: () => {
							if (modules.includes('shared-listing')) {
								dashNavigate(['products', 'add']);
							} else {
								createAutoDraftProduct();
							}
						},
					},
				]}
			/>

			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{}}
				filters={filters}
				bulkActions={bulkActions}
				onBulkActionApply={(action: string, selectedIds: []) =>
					handleBulkAction(action, selectedIds)
				}
				format={appLocalizer.date_format}
				currency={{
					currencySymbol:    appLocalizer.currency_symbol,
					priceDecimals:     appLocalizer.price_decimals,
					decimalSeparator:  appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition:  appLocalizer.currency_position,
				}}
			/>
		</>
	);
};

export default AllProduct;