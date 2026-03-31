/* global appLocalizer */
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
	InfoItem,
} from 'zyra';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toWcIsoDate, dashNavigate } from '../services/commonFunction';
import { applyFilters } from '@wordpress/hooks';

const STATUS_LABELS: Record<string, string> = {
	all: __('All', 'multivendorx'),
	publish: __('Published', 'multivendorx'),
	draft: __('Draft', 'multivendorx'),
	pending: __('Pending', 'multivendorx'),
	private: __('Private', 'multivendorx'),
	trash: __('Trash', 'multivendorx'),
};
interface Language {
	code: string;
	name: string;
	flag_url?: string;
	[key: string]: unknown;
}
interface ProductRow {
	id: number;
	name: string;
	price: string;
	stock_status: string;
	categories?: Array<{ id: number; name: string }>;
	date_created: string;
	status: string;
	permalink: string;
	[key: string]: unknown;
}

const AllProduct: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);
	const [categoriesList, setCategoriesList] = useState<
		{ id: number; name: string }[]
	>([]);
	const [newProductId, setNewProductId] = useState<number | null>(null);
	const [bulkActionContent, setBulkActionContent] = useState<React.ReactNode>(null);
	const { modules } = useModules();
	const navigate = useNavigate();

	const createAutoDraftProduct = () => {
		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/products/`,
				{ name: 'Auto Draft', status: 'draft' },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then((res) => setNewProductId(res.data.id))
			.catch((err) =>
				console.error('Error creating auto draft product:', err)
			);
	};

	useEffect(() => {
		if (!newProductId) {
			return;
		}
		dashNavigate(navigate, ['products', 'edit', String(newProductId)]);
	}, [newProductId]);

	const fetchCategories = async () => {
		try {
			const response = await axios.get(
				`${appLocalizer.apiUrl}/wc/v3/products/categories`,
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			);
			setCategoriesList(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const fetchProductStatusCounts = async () => {
		try {
			const statuses = Object.keys(STATUS_LABELS);

			const results = await Promise.allSettled(
				statuses.map(async (status) => {
					const params = {
						per_page: 1,
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					};
					if (status !== 'all') {
						params.status = status;
					}

					const res = await axios.get(
						`${appLocalizer.apiUrl}/wc/v3/products`,
						{
							headers: { 'X-WP-Nonce': appLocalizer.nonce },
							params,
						}
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
						: {
								value: statuses[index],
								label: STATUS_LABELS[statuses[index]],
								count: 0,
							}
				)
			);
		} catch (error) {
			console.error('Error fetching product status counts:', error);
		}
	};

	const fetchWpmlTranslations = () => {
		if (!modules.includes('wpml')) {
			return;
		}

		axios
			.get(getApiLink(appLocalizer, 'multivendorx-wpml'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const langs = response.data || [];
				if (langs.length) {
					fetchLanguageWiseProductCounts(langs);
				}
			})
			.catch((err) =>
				console.error('Error fetching WPML translations:', err)
			);
	};

	const fetchLanguageWiseProductCounts = async (langs: Language[]) => {
		if (!langs?.length) {
			return;
		}

		const fetchCount = async (lang: Language) => {
			try {
				const res = await axios.get(
					`${appLocalizer.apiUrl}/wc/v3/products`,
					{
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
						params: {
							per_page: 1,
							lang: lang.code,
							meta_key: 'multivendorx_store_id',
							value: appLocalizer.store_id,
						},
					}
				);
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
		if (!languageItems.length) {
			return;
		}

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
		await axios.delete(
			`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
			{
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			}
		);
		doRefreshTableData({});
	};

	const handleBulkAction = (action: string, selectedIds: number[]) => {
		if (action === 'delete') {
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
				});
			return;
		}

		const result = applyFilters(
			'multivendorx_products_bulk_action_handler',
			null,
			action,
			selectedIds,
			appLocalizer,
		);
		setBulkActionContent(result); 
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					search: query.searchValue || '',
					status:
						query.categoryFilter === 'all'
							? 'any'
							: query.categoryFilter,
					type: query.filter?.productType,
					category: query.filter?.category,
					stock_status: query.filter?.stockStatus,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(
								query.filter.created_at.startDate,
								'start'
							)
						: undefined,
					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
					meta_key: 'multivendorx_store_id',
					value: appLocalizer.store_id,
				},
			})
			.then((response) => {
				const items = response.data || [];
				setRowIds(
					items
						.filter((item) => item?.id != null)
						.map((item) => item.id)
				);
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

	const bulkActions = applyFilters(
		'multivendorx_products_bulk_actions',
		[{ label: 'Delete', value: 'delete' }],
		modules
	);

	const filters = [
		{
			key: 'category',
			type: 'select',
			label: __('Category', 'multivendorx'),
			options: categoriesList.map((cat) => ({
				value: cat.id,
				label: cat.name,
			})),
		},
		{
			key: 'productType',
			type: 'select',
			label: __('Product Type', 'multivendorx'),
			options: [
				{
					value: 'simple',
					label: __('Simple Product', 'multivendorx'),
				},
				{
					value: 'variable',
					label: __('Variable Product', 'multivendorx'),
				},
				{
					value: 'grouped',
					label: __('Grouped Product', 'multivendorx'),
				},
				{
					value: 'external',
					label: __('External/Affiliate Product', 'multivendorx'),
				},
			],
		},
		{
			key: 'stockStatus',
			type: 'select',
			label: __('Stock Status', 'multivendorx'),
			options: [
				{ value: 'instock', label: __('In Stock', 'multivendorx') },
				{
					value: 'outofstock',
					label: __('Out of Stock', 'multivendorx'),
				},
				{
					value: 'onbackorder',
					label: __('On Backorder', 'multivendorx'),
				},
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
			width: 18,
			render: (row) => {
				return (
					<InfoItem
						title={row.name}
						onClick={() =>
							dashNavigate(navigate, [
								'products',
								'edit',
								String(row.id),
							])
						}
						avatar={{
							image: row.images?.[0]?.src || '',
							iconClass: row.images?.[0]?.src
								? ''
								: 'single-product',
						}}
						descriptions={[
							{
								label: __('SKU:', 'multivendorx'),
								value: row.sku || '—',
							},
						]}
					/>
				);
			},
		},
		price: {
			label: __('Price', 'multivendorx'),
			type: 'currency',
		},
		stock_status: {
			label: __('Stock', 'multivendorx'),
			type: 'status',
			ClassName: 'transparent-status',
		},
		categories: {
			label: __('Categories', 'multivendorx'),
			render: (row: ProductRow) =>
				Array.isArray(row.categories) && row.categories.length
					? row.categories.map((c) => c.name).join(', ')
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
			actions: applyFilters(
				'multivendorx_products_table_actions',
				[
					{
						label: __('Edit', 'multivendorx'),
						icon: 'edit',
						onClick: (row: ProductRow) =>
							dashNavigate(navigate, [
								'products',
								'edit',
								String(row.id),
							]),
					},
					{
						label: __('View', 'multivendorx'),
						icon: 'eye',
						onClick: (row: ProductRow) =>
							window.location.assign(row.permalink),
					},
					{
						label: __('Copy URL', 'multivendorx'),
						icon: 'copy',
						onClick: (row: ProductRow) =>
							navigator.clipboard
								.writeText(row.permalink)
								.catch(() => {}),
					},
					{
						label: __('Delete', 'multivendorx'),
						icon: 'delete delete',
						onClick: (row: ProductRow) => handleDelete(row.id),
					},
				],
				modules
			),
		},
	};

	return (
		<>
			<NavigatorHeader
				headerTitle={__('All Products', 'multivendorx')}
				headerDescription={__(
					'Products are created, updated, and managed for your store.',
					'multivendorx'
				)}
				buttons={applyFilters(
					'multivendorx_product_list_header_buttons',
					[
						...(modules.includes('import-export')
							? [
									{
										custom: applyFilters(
											'product_import_export',
											null
										),
									},
								]
							: []),

						{
							label: __('Add New', 'multivendorx'),
							icon: 'plus',
							onClick: () => {
								if (
									modules.includes('shared-listing') &&
									appLocalizer.settings_databases_value
										.onboarding?.store_selling_mode ==
										'shared_listing'
								) {
									dashNavigate(navigate, ['products', 'add']);
								} else {
									createAutoDraftProduct();
								}
							},
						},
					],
					modules,
					dashNavigate,
					navigate
				)}
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
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position,
				}}
			/>

			{bulkActionContent}
		</>
	);
};

export default AllProduct;
