import React, { useEffect, useState } from 'react';
import {
	Legend,
	ResponsiveContainer,
	BarChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Bar,
	Tooltip,
} from 'recharts';
import { __ } from '@wordpress/i18n';
import { Analytics, Card, Column, Container, getApiLink, InfoItem, ComponentStatusView, Table, TableCard, TableCell } from 'zyra';
import axios from 'axios';
import { downloadCSV, formatCurrency, toWcIsoDate } from '../../services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';
import Counter from '@/services/Counter';



type ToggleState = { [key: string]: boolean };

const ProductReport: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [store, setStore] = useState([]);

	const [error, setError] = useState<string | null>(null);
	const [toReviewedProduct, setToReviewedProduct] = useState<any[]>([]);
	const [toSellingProduct, setToSellingProduct] = useState<any[]>([]);
	const [openReviewedCards, setOpenReviewedCards] = useState<ToggleState>({});
	const [chartData, setChartData] = useState<any[]>([]);
	const [inStockCount, setInStockCount] = useState(0);
	const [outOfStockCount, setOutOfStockCount] = useState(0);
	const [onBackorderCount, setOnBackorderCount] = useState(0);
	const [isDashboardLoading, setIsDashboardLoading] = useState(false);
	const [isTableLoading, setIsTableLoading] = useState(false);

	const toggleReviewedCard = (key: string) => {
		setOpenReviewedCards((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	useEffect(() => {
		const fetchChartData = async () => {
			setIsDashboardLoading(true);
			try {
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

						setStore(options);
						setIsDashboardLoading(false);
					})
					.catch(() => {
						setError(__('Failed to load stores', 'multivendorx'));
						setStore([]);
						setIsDashboardLoading(false);
					});

				// 3. Chart data
				axios({
					method: 'GET',
					url: `${appLocalizer.apiUrl}/wc/v3/products`,
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: { meta_key: 'multivendorx_store_id', per_page: 20 },
				})
					.then((response) => {
						const products = response.data || [];
						const data = products
							.filter((p: any) => Number(p.total_sales) > 0)
							.map((p: any) => ({
								name: p.name,
								net_sales:
									parseFloat(p.price || 0) *
									parseInt(p.total_sales || 0),
								items_sold: parseInt(p.total_sales || 0),
							}));
						setChartData(data);
					})
					.finally(() => { setIsDashboardLoading(false); })
					.catch(() => setError('Failed to load product sales data'));

				// 4. Top reviewed products
				axios({
					method: 'GET',
					url: `${appLocalizer.apiUrl}/wc/v3/products`,
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						per_page: 5,
						meta_key: 'multivendorx_store_id',
						orderby: 'rating',
						order: 'desc',
					},
				})
					.then((response) =>
						setToReviewedProduct(
							response.data.filter(
								(product: any) =>
									parseFloat(product.average_rating) > 0
							)
						)
					)
					.finally(() => { setIsDashboardLoading(false); })
					.catch((error) =>
						console.error(
							'Error fetching top reviewed products:',
							error
						)
					);

				// 5. Top selling products
				axios({
					method: 'GET',
					url: `${appLocalizer.apiUrl}/wc/v3/products`,
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						per_page: 5,
						meta_key: 'multivendorx_store_id',
						orderby: 'popularity',
						order: 'desc',
					},
				})
					.then((response) =>
						setToSellingProduct(
							response.data.filter(
								(product: any) =>
									Number(product.total_sales) > 0
							)
						)
					)
					.finally(() => { setIsDashboardLoading(false); })
					.catch((error) =>
						console.error(
							'Error fetching top selling products:',
							error
						)
					);

				// 6. Stock counts (each status separate)
				const stockStatuses = ['instock', 'outofstock', 'onbackorder'];
				stockStatuses.forEach((status) => {
					axios({
						method: 'GET',
						url: `${appLocalizer.apiUrl}/wc/v3/products`,
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
						params: {
							meta_key: 'multivendorx_store_id',
							per_page: 1,
							stock_status: status,
						},
					})
						.then((response) => {
							const count =
								Number(response.headers['x-wp-total']) || 0;
							if (status === 'instock') {
								setInStockCount(count);
							} else if (status === 'outofstock') {
								setOutOfStockCount(count);
							} else if (status === 'onbackorder') {
								setOnBackorderCount(count);
							}
						})
						.finally(() => { setIsDashboardLoading(false); })
						.catch((error) =>
							console.error(
								`Error fetching ${status} count:`,
								error
							)
						);
				});
			} catch (err) {
				console.error('Dashboard fetch failed:', err);
				setError(__('Failed to load dashboard data', 'multivendorx'));
			}
		};

		fetchChartData();
	}, []);

	const overview = [
		{
			id: 'sales',
			label: 'Total Products',
			count: totalRows,
			icon: 'single-product',
		},
		{
			id: 'earnings',
			label: 'In Stock',
			count: inStockCount,
			icon: 'per-product-shipping',
		},
		{
			id: 'Vendors',
			label: 'On backorder',
			count: onBackorderCount,
			icon: 'multi-product',
		},
		{
			id: 'free',
			label: 'Out of Stock',
			count: outOfStockCount,
			icon: 'out-of-stock',
		},
	];

	const headers = [
		{ key: 'product', label: __('Product', 'multivendorx') },
		{ key: 'store', label: __('Store', 'multivendorx') },
		{ key: 'itemsSold', label: __('Items sold', 'multivendorx') },
		{ key: 'netSales', label: __('Net sales', 'multivendorx') },
		{ key: 'category', label: __('Category', 'multivendorx') },
		{ key: 'date', label: __('Date Created', 'multivendorx'), isSortable: true, },
	];

	const fetchData = (query: QueryProps) => {
		setIsTableLoading(true);
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					page: query.paged,
					per_page: query.per_page,
					search: query.searchValue,
					orderby: query.orderby,
					order: query.order,
					meta_key: 'multivendorx_store_id',
					value: query?.filter?.store_id,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(query.filter.created_at.startDate, 'start')
						: undefined,

					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
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
						value: product.id,
						display: product.name,
						data: {
							id: product.id,
							name: product.name,
							sku: product.sku,
							image: product.images?.[0]?.src || '',
							link: `${appLocalizer.site_url}/wp-admin/post.php?post=${product.id}&action=edit`,
						},
					},
					{
						display: product.store_name,
						value: product.store_name,
					},
					{
						display: product.total_sales || 0,
						value: product.total_sales,
					},
					{
						display: product.price
							? formatCurrency(product.price)
							: '-',
						value: product.price,
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
				]);

				setRows(mappedRows);
				setTotalRows(
					Number(response.headers['x-wp-total']) || 0
				);
				setIsTableLoading(false);
			})
			.catch((error) => {
				console.error('Product fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsTableLoading(false);
			});
	};

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
	const buttonActions = [
		{
			label: 'Download CSV',
			icon: 'download',
			onClickWithQuery: (query: QueryProps) => {
				downloadProductsCSV(query);
			},
		},
	];
	const downloadProductsCSV = (query: QueryProps) => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					per_page: 100, // WooCommerce max per page
					page: 1,
					search: query.searchValue,
					orderby: query.orderby,
					order: query.order,
					meta_key: 'multivendorx_store_id',
					value: query?.filter?.store_id,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(query.filter.created_at.startDate, 'start')
						: undefined,
					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
				},
			})
			.then((response) => {
				const products = Array.isArray(response.data)
					? response.data
					: [];

				const csvData = products.map((product) => ({
					ID: product.id,
					Product: product.name,
					SKU: product.sku || '',
					Store: product.store_name || '',
					Items_Sold: Number(product.total_sales || 0),
					Net_Sales: product.price
						? formatCurrency(product.price)
						: '',
					Category:
						product.categories
							?.map((c: { name: string }) => c.name)
							.join(', ') || '',
					Date_Created: product.date_created
						? product.date_created
						: '',
				}));

				downloadCSV({
					data: csvData,
					filename: 'products-report.csv',
					headers: {
						ID: 'Product ID',
						Product: 'Product Name',
						SKU: 'SKU',
						Store: 'Store',
						Items_Sold: 'Items Sold',
						Net_Sales: 'Net Sales',
						Category: 'Category',
						Date_Created: 'Date Created',
					},
				});
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};

	return (
		<>
			<Container>
				{/* Keep entire top dashboard layout */}
				<Column row>
					<Analytics
						cols={2}
						data={overview.map((item, idx) => ({
							icon: item.icon,
							iconClass: `admin-color${idx + 2}`,
							number: <Counter value={item.count} />,
							text: __(item.label, 'multivendorx'),
						}))}
						isLoading={isDashboardLoading}
					/>

					<Card title="Revenue & Sales Comparison">
						{error ? (
							<p>{error}</p>
						) : chartData.length > 0 ? (
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={chartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar
										dataKey="net_sales"
										fill="#5007aa"
										name={__(
											'Net Sales',
											'multivendorx'
										)}
									/>
									<Bar
										dataKey="items_sold"
										fill="#00c49f"
										name={__(
											'Items Sold',
											'multivendorx'
										)}
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<ComponentStatusView title={__('No product sales data found.', 'multivendorx')} />
						)}
					</Card>
				</Column>

				{/* Categories and brands */}
				<Column row>
					{/* Top Reviewed Products Section */}
					<Card title="Top Reviewed Products">
						{toReviewedProduct.length > 0 ? (
							toReviewedProduct.map((product: any) => (
								<div
									className="card-content"
									key={`review-${product.id}`}
								>
									<div
										className="card-header"
										onClick={() =>
											toggleReviewedCard(
												product.id.toString()
											)
										}
									>
										<div className="left">
											<div className="product-name font-medium">
												{product.name}
											</div>
											<div className="price text-sm text-gray-600">
												<b>
													{__(
														'Rating:',
														'multivendorx'
													)}
												</b>{' '}
												{product.average_rating ||
													'0'}
												<i className="adminfont-card"></i>
											</div>
										</div>
										<div className="right">
											<i
												className={`adminfont-pagination-right-arrow ${openReviewedCards[
													product.id
												]
													? 'rotate-90 transition-transform'
													: ''
													}`}
											></i>
										</div>
									</div>

									{openReviewedCards[product.id] && (
										<div className="top-items">
											<div className="items">
												<div className="left-side flex items-center">
													<div className="avatar">
														{product.images
															?.length ? (
															<img
																src={
																	product
																		.images[0]
																		.src
																}
																alt={
																	product.name
																}
															/>
														) : (
															<div>
																{product.name?.charAt(
																	0
																) || '?'}
															</div>
														)}
													</div>

													<div className="details text-sm leading-6">
														<div>
															{__(
																'Price:',
																'multivendorx'
															)}
															<span
																dangerouslySetInnerHTML={{
																	__html:
																		product.price_html ||
																		product.price ||
																		'-',
																}}
															/>
														</div>
														<div>
															{__(
																'Total Sales:',
																'multivendorx'
															)}
															{product.total_sales ||
																0}
														</div>
														<div>
															{__(
																'Category:',
																'multivendorx'
															)}
															{product.categories
																?.map(
																	(
																		c: any
																	) =>
																		c.name
																)
																.join(
																	', '
																) || '-'}
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							))
						) : (
							<ComponentStatusView title={__('No reviewed products found.', 'multivendorx')} />
						)}
					</Card>
					<Card title="Top Selling Products">
						{toSellingProduct.length > 0 ? (
							toSellingProduct.map(
								(product: any, index: number) => (
									<InfoItem
										key={`selling-${product.id}`}
										title={product.name}
										avatar={{
											image: product.images?.[0]?.src,
											text: product.name?.charAt(0) || '?',
											iconClass: `admin-color${index + 1}`,
										}}
										descriptions={[
											{
												label: __('Total Sales:', 'multivendorx'),
												value: product.total_sales || 0,
											},
										]}
									/>
								)
							)
						) : (
							<ComponentStatusView title={__('No top selling products found.', 'multivendorx')} />
						)}
					</Card>
				</Column>
			</Container>

			<div className="card-header admin-pt-2">
				<div className="left">
					<div className="title">
						{__('Revenue Distribution', 'multivendorx')}
					</div>
				</div>
			</div>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isTableLoading}
				onQueryUpdate={fetchData}
				search={{ placeholder: 'Search Products...' }}
				filters={filters}
				buttonActions={buttonActions}
				rowIds={rowIds}
				format={appLocalizer.date_format}
			/>
		</>
	);
};

export default ProductReport;
