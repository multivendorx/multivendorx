import React, { useState, useEffect, useRef, act } from 'react';
import { __ } from '@wordpress/i18n';
import {
	useModules,
	getApiLink,
	TableCard,
	NavigatorHeader,
} from 'zyra';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '../services/commonFunction';
import AddProductCom from './addProducts';
import SpmvProducts from './spmvProducts';
import { applyFilters } from '@wordpress/hooks';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

const STATUS_LABELS: Record<string, string> = {
	all: __('All', 'multivendorx'),
	publish: __('Published', 'multivendorx'),
	draft: __('Draft', 'multivendorx'),
	pending: __('Pending', 'multivendorx'),
	private: __('Private', 'multivendorx'),
	trash: __('Trash', 'multivendorx'),
};

const AllProduct: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);
	const [productMap, setProductMap] = useState<Record<number, any>>({});
	const [categoriesList, setCategoriesList] = useState<
		{ id: number; name: string }[]
	>([]);
	const { modules } = useModules();
	const [newProductId, setNewProductId] = useState(null);

	const location = useLocation();
	const navigate = useNavigate();
	const siteUrl = appLocalizer.site_url.replace(/\/$/, '');
	const basePath = siteUrl.replace(window.location.origin, '');

	const params = new URLSearchParams(location.search);

	let element = params.get('element');

	if (!element) {
		const path = location.pathname;
		if (path.includes('/edit/')) element = 'edit';
		else if (path.includes('/add/')) element = 'add';
	}

	const isAddProduct = element === 'edit';
	const isSpmvOn = element === 'add';

	const handleDelete = async (productId: number) => {
		const res = await axios.delete(
			`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
			{
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			}
		);
		fetchData({});
	};

	const createAutoDraftProduct = () => {
		const payload = {
			name: 'Auto Draft',
			status: 'draft',
		};

		axios
			.post(`${appLocalizer.apiUrl}/wc/v3/products/`, payload, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				setNewProductId(res.data.id);
			})
			.catch((err) => {
				console.error('Error creating auto draft product:', err);
			});
	};

	useEffect(() => {
		if (!newProductId) {
			return;
		}

		if (appLocalizer.permalink_structure) {
			navigate(
				`${basePath}/${appLocalizer.dashboard_slug}/products/edit/${newProductId}`
			);
		} else {
			navigate(
				`${basePath}/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${newProductId}`
			);
		}
	}, [newProductId]);

	const fetchCategories = async () => {
		try {
			const response = await axios.get(
				`${appLocalizer.apiUrl}/wc/v3/products/categories`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);
			setCategoriesList(response.data);
		} catch (error) {
		}
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

					const total = parseInt(res.headers['x-wp-total'] || '0');

					return {
						value: status,
						label: STATUS_LABELS[status],
						count: total,
					};
				})
			);

			// Normalize results
			const counts = results.map((result, index) => {
				if (result.status === 'fulfilled') {
					return result.value;
				}

				// fallback if request failed
				const failedStatus = statuses[index];

				return {
					value: failedStatus,
					label: STATUS_LABELS[failedStatus],
					count: 0,
				};
			});

			setCategoryCounts(counts);

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

				if (langs.length) {
					fetchLanguageWiseProductCounts(langs);
				}
			})
			.catch((err) => {
				console.error('Error fetching WPML translations:', err);
			});
	};

	const fetchLanguageWiseProductCounts = async (langs: any[]) => {
		if (!langs?.length) return;

		const fetchCount = async (lang: any) => {
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

		const languageItems = counts.filter(l => l.count > 0);
		if (!languageItems.length) return;

		const totalCount = languageItems.reduce((sum, l) => sum + l.count, 0);

		setCategoryStatus(prev => [
			...prev.filter(
				item =>
					item.value !== 'all_lang' &&
					!langs.some(lang => lang.code === item.value)
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

	const handleBulkAction = (action: string, selectedIds: []) => {
		if (action === 'delete') {
			axios
				.post(
					`${appLocalizer.apiUrl}/wc/v3/products/batch`,
					{
						delete: selectedIds,
					},
					{
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
					}
				)
				.then(() => {
					fetchCategories();
					fetchProductStatusCounts();
					fetchWpmlTranslations();
					fetchData({});
				})
				.catch((err: unknown) => {
					console.error('Error performing bulk product action:', err);
				});
		}
	};

	const bulkActions = [
		{ label: 'Delete', value: 'delete' },
	];

	const headers = [
		{ key: 'id', label: 'Product Name' },
		{ key: 'price', label: 'Price' },
		{ key: 'stock_status', label: 'Stock' },
		{ key: 'category', label: 'Categories' },
		{ key: 'date_created', label: 'Date' },
		{ key: 'status', label: 'Status' },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (id: number) => {
						if (appLocalizer.permalink_structure) {
							navigate(
								`${basePath}/${appLocalizer.dashboard_slug}/products/edit/${id}/`
							);
						} else {
							navigate(
								`${basePath}/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${id}`
							);
						}
					},
				},
				{
					label: __('View', 'multivendorx'),
					icon: 'eye',
					onClick: (id: number) => {
						const product = productMap[id];
						window.location.assign(
							`${product.permalink}`
						);
					},
				},
				{
					label: __('Copy URL', 'multivendorx'),
					icon: 'copy',
					onClick: (id: number) => {
						const url = productMap[id].permalink;
						navigator.clipboard
							.writeText(url)
							.catch(() => { });
					},
				},
				{
					label: __('Delete', 'multivendorx'),
					icon: 'adminfont-delete delete',
					onClick: (id: number) => {
						handleDelete(id);
					},

				},
			],
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					// status: query.categoryFilter || '',
					search: query.searchValue || '',
					type: query.filter?.productType,
					category: query.filter?.category,
					stock_status: query.filter?.stockStatus,
					// after: query.filter?.created_at?.startDate
					// 	? formatLocalDate(query.filter.created_at.startDate)
					// 	: '',
					// before: query.filter?.created_at?.endDate
					// 	? formatLocalDate(query.filter.created_at.endDate)
					// 	: '',
					meta_key: 'multivendorx_store_id',
					value: appLocalizer.store_id,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item: any) => item?.id != null)
					.map((item: any) => item.id);

				setRowIds(ids);
				const productMap = items.reduce((acc: any, product: any) => {
					acc[product.id] = product;
					return acc;
				}, {});

				setProductMap(productMap);
				const mappedRows: any[][] = items.map((product: any) => [
					{
						value: product.id,
						display: product.name,
						type: 'card',
						data: {
							name: product.name,
							image: product.images?.[0]?.src || '',
							description: `SKU: ${product.sku}`,
							link: `${appLocalizer.site_url}/wp-admin/post.php?post=${product.id}&action=edit`,
							icon: 'adminfont-store-inventory'
						},
					},
					{
						display: product.price
							? formatCurrency(product.price)
							: '-',
						value: product.price,
					},
					{
						display: product.stock_status,
						value: product.stock_status,
					},
					{
						display: product.categories
							?.map((c: any) => c.name)
							.join(', ') || '-',
						value: product.id,

					},
					{
						display: product.date_created
							? product.date_created
							: '-',
						value: product.date_created,
					},
					{
						display: product.status,
						value: product.status,
					},
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

	const filters = [
		{
			key: 'category',
			type: 'select',
			options: categoriesList.map(cat => ({
				value: cat.id,
				label: cat.name,
			})),
		},
		{
			key: 'productType',
			type: 'select',
			options: [
				{ value: 'simple', label: 'Simple Product' },
				{ value: 'variable', label: 'Variable Product' },
				{ value: 'grouped', label: 'Grouped Product' },
				{ value: 'external', label: 'External/Affiliate Product' },
			],
		},
		{
			key: 'stock_status',
			type: 'select',
			options: [
				{ value: 'instock', label: 'In Stock' },
				{ value: 'outofstock', label: 'Out of Stock' },
				{ value: 'onbackorder', label: 'On Backorder' },
			],
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		}
	];

	return (
		<>
			{!isAddProduct && !isSpmvOn && (
				<>
					{/* <div className="page-title-wrapper">
						<div className="page-title">
							<div className="title">{__('All Products', 'multivendorx')}</div>
							<div className="des">
								{__('Manage your store products', 'multivendorx')}
							</div>
						</div>
						<div className="buttons-wrapper">
							{modules.includes('import-export') &&
								applyFilters(
									'product_import_export',
									null,
								)
							}
							<div
								className="admin-btn btn-purple-bg"
								onClick={() => {
									if (modules.includes('shared-listing')) {
										if (appLocalizer.permalink_structure) {
											navigate(
												`${basePath}/${appLocalizer.dashboard_slug}/products/add/`
											);
										} else {
											navigate(
												`${basePath}/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=add`
											);
										}
									} else {
										createAutoDraftProduct();
									}
								}}
							>
								<i className="adminfont-plus"></i> {__('Add New', 'multivendorx')}
							</div>
						</div>
					</div> */}
					<NavigatorHeader
						headerTitle={__('All Products', 'multivendorx')}
						headerDescription={__('Manage your store products', 'multivendorx')}
						buttons={[
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
									if (modules.includes('shared-listing')) {
										if (appLocalizer.permalink_structure) {
											navigate(
												`${basePath}/${appLocalizer.dashboard_slug}/products/add/`
											);
										} else {
											navigate(
												`${basePath}/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=add`
											);
										}
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
						onQueryUpdate={fetchData}
						ids={rowIds}
						categoryCounts={categoryCounts}
						search={{}}
						filters={filters}
						bulkActions={bulkActions}
						onBulkActionApply={(action: string, selectedIds: []) => {
							handleBulkAction(action, selectedIds)
						}}
						format={appLocalizer.date_format}
					/>
				</>
			)}

			{isAddProduct && <AddProductCom />}
			{isSpmvOn && <SpmvProducts />}
		</>
	);
};

export default AllProduct;
