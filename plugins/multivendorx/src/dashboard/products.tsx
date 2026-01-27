import React, { useState, useEffect, useRef, act } from 'react';
import { __ } from '@wordpress/i18n';
import {
	useModules,
	Table,
	TableCell,
	MultiCalendarInput,
	getApiLink,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency, formatWcShortDate } from '../services/commonFunction';
import AddProductCom from './add-products';
import SpmvProducts from './spmv-products';
import { ReactNode } from 'react';
import { applyFilters } from '@wordpress/hooks';

type ProductRow = {
	id: number;
	product_name?: string;
	product_sku?: string;
	price?: string;
	stock?: string;
	categories?: string;
	date?: string;
	status?: string;
};

type FilterData = {
	searchAction?: string;
	searchField?: string;
	category?: any;
	stock_status?: string;
	productType?: string;
	categoryFilter?: string;
	languageFilter?: string;
};
type ProductStatus = {
	key: string;
	name: string;
	count: number;
};
export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => ReactNode;
}

const stockStatusOptions = [
	{ key: '', name: 'Stock Status' },
	{ key: 'instock', name: 'In Stock' },
	{ key: 'outofstock', name: 'Out of Stock' },
	{ key: 'onbackorder', name: 'On Backorder' },
];

const productTypeOptions = [
	{ key: '', name: 'Product Type' },
	{ key: 'simple', name: 'Simple Product' },
	{ key: 'variable', name: 'Variable Product' },
	{ key: 'grouped', name: 'Grouped Product' },
	{ key: 'external', name: 'External/Affiliate Product' },
];

const STATUS_LABELS: Record<string, string> = {
	all: __('All', 'multivendorx'),
	publish: __('Published', 'multivendorx'),
	draft: __('Draft', 'multivendorx'),
	pending: __('Pending', 'multivendorx'),
	private: __('Private', 'multivendorx'),
	trash: __('Trash', 'multivendorx'),
};

const AllProduct: React.FC = () => {
	const [data, setData] = useState<ProductRow[]>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [productStatus, setProductStatus] = useState<ProductStatus[]>([]);
	const [languageProductCounts, setLanguageProductCounts] = useState<ProductStatus[]>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [categoriesList, setCategoriesList] = useState<
		{ id: number; name: string }[]
	>([]);
	const [pageCount, setPageCount] = useState(0);
	const { modules } = useModules();
	const [newProductId, setNewProductId] = useState(null);

	const location = useLocation();
	const navigate = useNavigate();
	const siteUrl = appLocalizer.site_url.replace(/\/$/, '');
	const basePath = siteUrl.replace(window.location.origin, '');
	const [dateFilter, setDateFilter] = useState<{
		start_date: Date;
		end_date: Date;
	}>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});
	const bulkSelectRef = useRef<HTMLSelectElement>(null);

	const params = new URLSearchParams(location.search);

	let element = params.get('element');

	if (!element) {
		const path = location.pathname;
		if (path.includes('/edit/')) element = 'edit';
		else if (path.includes('/add/')) element = 'add';
	}

	const isAddProduct = element === 'edit';
	const isSpmvOn = element === 'add';

	const handleDelete = async (productId) => {
		const res = await axios.delete(
			`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
			{
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			}
		);

		requestData();
	};

	const createAutoDraftProduct = () => {
		try {
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
				});
		} catch (err) {
			console.error(
				'Error creating auto-draft:',
				err.response?.data || err
			);
		}
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
			console.error('Error fetching categories:', error);
		}
	};

	const fetchProductStatusCounts = async () => {
		try {
			const statuses = ['all', 'publish', 'draft', 'pending', 'private', 'trash'];

			const counts: ProductStatus[] = await Promise.all(
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
						key: status,
						name: STATUS_LABELS[status],
						count: total,
					};
				})
			);

			setProductStatus(
				counts.filter((s) => s.count > 0)
			);
		} catch (error) {
			console.error('Failed to fetch product status counts:', error);
		}
	};


	const fetchWpmlTranslations = async () => {
		if (!modules.includes('wpml')) return;
	
		try {
			const response = await axios.get(
				getApiLink(appLocalizer, 'multivendorx-wpml'),
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);
	
			const langs = response.data || [];
	
			// Directly fetch and merge language-wise product counts
			if (langs.length) {
				fetchLanguageWiseProductCounts(langs);
			}
		} catch (err) {
			console.error('Failed to fetch WPML translations', err);
		}
	};
	

	const fetchLanguageWiseProductCounts = async (langs: any[]) => {
		if (!langs?.length) return;
	
		try {
			const counts = await Promise.all(
				langs.map(async (lang) => {
					const params: any = {
						per_page: 1,
						lang: lang.code,
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					};
	
					const res = await axios.get(
						`${appLocalizer.apiUrl}/wc/v3/products`,
						{
							headers: { 'X-WP-Nonce': appLocalizer.nonce },
							params,
						}
					);
	
					const total = parseInt(res.headers['x-wp-total'] || '0');
	
					return {
						key: lang.code, 
						name: lang.name,
						count: total,
					};
				})
			);
	
			const languageItems = counts.filter(c => c.count > 0);
	
			// Do nothing if no language has products
			if (!languageItems.length) {
				return;
			}
	
			const allLangItem: ProductStatus = {
				key: 'all_lang',
				name: __('All Languages', 'multivendorx'),
				count: languageItems.reduce((sum, l) => sum + l.count, 0),
			};
	
			setProductStatus(prev => [
				...prev,
				allLangItem,
				...languageItems,
			]);
		} catch (error) {
			console.error('Failed to fetch language wise product counts:', error);
		}
	};
	
	useEffect(() => {
		fetchCategories();
		fetchProductStatusCounts();
		fetchWpmlTranslations();
	}, []);

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
	}, [pagination]);

	// Fetch data from backend.
	function requestData(
		rowsPerPage: number,
		currentPage: number,
		category?: string,
		stockStatus?: string,
		searchField?: string,
		productType?: string,
		startDate?: Date,
		endDate?: Date,
		categoryFilter?: string,
	) {
		category = category || '';
		stockStatus = stockStatus || '';
		searchField = searchField || '';
		productType = productType || '';
		startDate = startDate || new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
		endDate = endDate || new Date();
		categoryFilter = categoryFilter || '';

		setData(null);
		const params: any = {
			page: currentPage,
			row: rowsPerPage,
			category: category,
			after: startDate,
			before: endDate,
			meta_key: 'multivendorx_store_id',
			value: appLocalizer.store_id,
		};

		if (stockStatus) {
			params.stock_status = stockStatus;
		}

		if (searchField) {
			params.search = searchField;
		}
		if (productType) {
			params.type = productType;
		}

		if (categoryFilter && categoryFilter !== 'all') {
			const WC_STATUSES = ['publish', 'draft', 'pending', 'private', 'trash'];
		
			if (categoryFilter === 'all_lang') {
				params.lang = 'all';
			} else if (WC_STATUSES.includes(categoryFilter)) {
				params.status = categoryFilter;
			} else {
				params.lang = categoryFilter;
			}
		}
		
		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/products`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: params, // Use the dynamically built params object
		})
			.then((response) => {
				const formattedProducts = response.data.map((p: any) => ({
					id: p.id,
					name: p.name,
					sku: p.sku || '-',
					price: p.price ? `${p.price}` : '-',
					stock_status: p.stock_status,
					categories: p.categories,
					date_created: p.date_created,
					status: p.status,
					permalink: p.permalink,
					image: p.images?.length ? p.images[0].src : null,
				}));
				setData(formattedProducts);

				const total = parseInt(response.headers['x-wp-total']);
				setTotalRows(total);
				setPageCount(Math.ceil(total / rowsPerPage));
			})
			.catch(() => {
				setData([]);
				setTotalRows(0);
				setPageCount(0);
			});
	}

	// Handle pagination and filter changes
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		const date = filterData?.date || {
			start_date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
			end_date: new Date(),
		};
		setDateFilter(date);

		requestData(
			rowsPerPage,
			currentPage,
			filterData?.category,
			filterData?.stock_status,
			filterData?.searchField,
			filterData?.productType,
			date.start_date,
			date.end_date,
			filterData?.categoryFilter,
			filterData?.languageFilter,
		);
	};

	const columns: ColumnDef<ProductRow>[] = [
		{
			id: 'select',
			header: ({ table }) => (
				<input
					type="checkbox"
					checked={table.getIsAllRowsSelected()}
					onChange={table.getToggleAllRowsSelectedHandler()}
				/>
			),
			cell: ({ row }) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					onChange={row.getToggleSelectedHandler()}
				/>
			),
		},
		{
			header: __('Product Name', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.name}>
					<a
						href={row.original.permalink}
						target="_blank"
						rel="noopener noreferrer"
						className="product-wrapper"
					>
						{row.original.image ? (
							<img
								src={row.original.image}
								alt={row.original.name}
							/>
						) : (
							<i className="item-icon adminfont-multi-product"></i>
						)}

						<div className="details">
							<span className="title">{row.original.name}</span>
							<span className="des">SKU: {row.original.sku}</span>
						</div>
					</a>
				</TableCell>
			),
		},
		{
			header: __('Price', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					{row.original.price !== '-'
						? formatCurrency(row.original.price)
						: '-'}
				</TableCell>
			),
		},
		{
			header: __('Stock', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					{row.original.stock_status === 'instock' && (
						<span className="admin-badge green-color">
							{__('In Stock', 'multivendorx')}
						</span>
					)}
					{row.original.stock_status === 'outofstock' && (
						<span className="admin-badge red-color">
							{__('Out of Stock', 'multivendorx')}
						</span>
					)}
					{row.original.stock_status === 'onbackorder' && (
						<span className="admin-badge yellow-color">
							{__('On Backorder', 'multivendorx')}
						</span>
					)}
					{!row.original.stock_status && '-'}
				</TableCell>
			),
		},
		{
			header: __('Categories', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					{row.original.categories?.length
						? row.original.categories.map((c) => c.name).join(', ')
						: '-'}
				</TableCell>
			),
		},
		{
			id: 'date_created',
			accessorKey: 'date_created',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					{formatWcShortDate(row.original.date_created)}
				</TableCell>
			),
		},
		{
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				const statusMap: Record<string, string> = {
					publish: 'Published',
					draft: 'Draft',
					pending: 'Pending',
					private: 'Private',
					trash: 'Trash',
				};

				const displayStatus = statusMap[row.original.status] || row.original.status;

				return <TableCell type="status" status={displayStatus} />;
			},
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							{
								label: __('Edit', 'multivendorx'),
								icon: 'adminfont-edit',
								onClick: (rowData) => {
									if (appLocalizer.permalink_structure) {
										navigate(
											`${basePath}/${appLocalizer.dashboard_slug}/products/edit/${rowData.id}/`
										);
									} else {
										navigate(
											`${basePath}/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${rowData.id}`
										);
									}
								},
							},
							{
								label: __('View', 'multivendorx'),
								icon: 'adminfont-eye',
								onClick: () => {
									window.location.assign(
										`${row.original.permalink}`
									);
								},
							},
							{
								label: __('Copy URL', 'multivendorx'),
								icon: 'adminfont-vendor-form-copy',
								onClick: () => {
									const url = row.original.permalink;
									navigator.clipboard
										.writeText(url)
										.catch(() => { });
								},
							},
							{
								label: __('Delete', 'multivendorx'),
								icon: 'adminfont-delete delete',
								onClick: (rowData) => {
									handleDelete(rowData.id);
								},

							},
						],
					}}
				/>
			),
		},
	];

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<>
					<div className="search-section">
						<input
							name="searchField"
							type="text"
							placeholder={__('Search', 'multivendorx')}
							onChange={(e) => {
								updateFilter(e.target.name, e.target.value);
							}}
							className="basic-select"
							value={filterValue || ''}
						/>
						<i className="adminfont-search"></i>
					</div>
				</>
			),
		},
	];

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'category',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="group-field">
					<select
						name="category"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">Category</option>
						{categoriesList?.map((s: any) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'productType',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="group-field">
					<select
						name="productType"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						{productTypeOptions?.map((s: any) => (
							<option key={s.key} value={s.key}>
								{s.name}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'stock_status',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="group-field">
					<select
						name="stock_status"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						{stockStatusOptions?.map((s: any) => (
							<option key={s.key} value={s.key}>
								{s.name}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'date',
			render: (updateFilter) => (
				<MultiCalendarInput
					value={{
						startDate: dateFilter.start_date,
						endDate: dateFilter.end_date,
					}}
					onChange={(range: { startDate: Date; endDate: Date }) => {
						const next = {
							start_date: range.startDate,
							end_date: range.endDate,
						};

						setDateFilter(next);
						updateFilter('date', next);
					}}
				/>
			),
		},
	];


	const handleBulkAction = async () => {
		const action = bulkSelectRef.current?.value;
		const selectedIds = Object.keys(rowSelection)
			.map((key) => {
				const index = Number(key);
				return data && data[index] ? data[index].id : null;
			})
			.filter((id): id is number => id !== null);

		if (!selectedIds.length) {
			return;
		}

		if (!action) {
			return;
		}
		setData(null);

		try {
			if (action === 'delete') {
				await axios({
					method: 'POST', // WooCommerce bulk endpoint uses POST
					url: `${appLocalizer.apiUrl}/wc/v3/products/batch`,
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					data: {
						delete: selectedIds, // array of product IDs to delete
					},
				});
			}

			// Refresh the data after action
			fetchCategories();
			fetchProductStatusCounts();
			fetchWpmlTranslations();
			requestData(pagination.pageSize, pagination.pageIndex + 1);
			setRowSelection({});
		} catch (err: unknown) {
			console.log(__(`Failed to perform bulk action ${err}`, 'multivendorx'));
		}
	};

	const BulkAction: React.FC = () => (
		<div className="action">
			<i className="adminfont-form"></i>
			<select
				name="action"
				ref={bulkSelectRef}
				onChange={handleBulkAction}
			>
				<option value="">{__('Bulk actions')}</option>
				<option value="delete">{__('Delete', 'multivendorx')}</option>
			</select>
		</div>
	);

	return (
		<>
			{!isAddProduct && !isSpmvOn && (
				<>
					<div className="page-title-wrapper">
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
									requestData,
									rowSelection,
									data,
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
					</div>
					<div className="admin-table-wrapper">
						<Table
							data={data}
							columns={
								columns as ColumnDef<Record<string, any>, any>[]
							}
							rowSelection={rowSelection}
							onRowSelectionChange={setRowSelection}
							defaultRowsPerPage={10}
							pageCount={pageCount}
							pagination={pagination}
							onPaginationChange={setPagination}
							perPageOption={[10, 25, 50]}
							realtimeFilter={realtimeFilter}
							handlePagination={requestApiForData}
							totalCounts={totalRows}
							searchFilter={searchFilter}
							categoryFilter={productStatus}
							bulkActionComp={() => <BulkAction />}
						/>
					</div>
				</>
			)}

			{isAddProduct && <AddProductCom />}
			{isSpmvOn && <SpmvProducts />}
		</>
	);
};

export default AllProduct;
