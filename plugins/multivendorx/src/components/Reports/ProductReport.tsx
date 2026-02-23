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
import {
	Analytics,
	Card,
	Column,
	Container,
	getApiLink,
	InfoItem,
	ComponentStatusView,
	TableCard,
} from 'zyra';
import axios from 'axios';
import {
	downloadCSV,
	formatCurrency,
	formatLocalDate,
	toWcIsoDate,
} from '../../services/commonFunction';
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
						params: { options: true },
					})
					.then((response) => {
						const options = (response.data || []).map(
							(store: any) => ({
								label: store.store_name,
								value: store.id,
							})
						);

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
					.finally(() => {
						setIsDashboardLoading(false);
					})
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
					.finally(() => {
						setIsDashboardLoading(false);
					})
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
					.finally(() => {
						setIsDashboardLoading(false);
					})
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
						.finally(() => {
							setIsDashboardLoading(false);
						})
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
			label: __('Total Products', 'multivendorx'),
			count: totalRows,
			icon: 'single-product',
		},
		{
			id: 'in_stock',
			label: __('In Stock', 'multivendorx'),
			count: inStockCount,
			icon: 'per-product-shipping',
		},
		{
			id: 'on_backorder',
			label: __('On Backorder', 'multivendorx'),
			count: onBackorderCount,
			icon: 'multi-product',
		},
		{
			id: 'out_of_stock',
			label: __('Out of Stock', 'multivendorx'),
			count: outOfStockCount,
			icon: 'out-of-stock',
		},
	];

	const headers = {
		name: {
			label: __('Product', 'multivendorx'),
		},
		store_name: {
			label: __('Store', 'multivendorx'),
		},
		total_sales: {
			label: __('Items sold', 'multivendorx'),
		},
		price: {
			label: __('Net sales', 'multivendorx'),
			type: 'currency',
		},
		category: {
			label: __('Category', 'multivendorx'),
			render: (row: any) =>
				row.categories?.map((c: any) => c.name).join(', ') || '-',
		},
		date_created: {
			label: __('Date Created', 'multivendorx'),
			isSortable: true,
			type: 'date',
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsTableLoading(true);
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildProductQueryParams(query),
			})
			.then((response) => {
				const products = Array.isArray(response.data)
					? response.data
					: [];

				const ids = products.map((p: any) => p.id);
				setRowIds(ids);

				setRows(products);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
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

	const downloadCSVByQuery = (query: QueryProps) => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildProductQueryParams(query, false),
			})
			.then((response) => {
				const rows = response.data || [];

				downloadCSV(
					headers,
					rows,
					`product-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};
	const buttonActions = [
		{
			label: __('Download CSV', 'multivendorx'),
			icon: 'download',
			onClickWithQuery: downloadCSVByQuery,
		},
	];
	const buildProductQueryParams = (
		query: QueryProps,
		includePagination: boolean = true
	) => {
		const params: Record<string, any> = {
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
		};

		if (includePagination) {
			params.page = query.page || 1;
			params.per_page = query.per_page || 10;
		}

		return params;
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
										name={__('Net Sales', 'multivendorx')}
									/>
									<Bar
										dataKey="items_sold"
										fill="#00c49f"
										name={__('Items Sold', 'multivendorx')}
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<ComponentStatusView
								title={__(
									'No product sales data found.',
									'multivendorx'
								)}
							/>
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
												{product.average_rating || '0'}
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
																	(c: any) =>
																		c.name
																)
																.join(', ') ||
																'-'}
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							))
						) : (
							<ComponentStatusView
								title={__(
									'No reviewed products found.',
									'multivendorx'
								)}
							/>
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
											text:
												product.name?.charAt(0) || '?',
											iconClass: `admin-color${index + 1}`,
										}}
										descriptions={[
											{
												label: __(
													'Total Sales:',
													'multivendorx'
												),
												value: product.total_sales || 0,
											},
										]}
									/>
								)
							)
						) : (
							<ComponentStatusView
								title={__(
									'No top selling products found.',
									'multivendorx'
								)}
							/>
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
				onQueryUpdate={doRefreshTableData}
				search={{ placeholder: 'Search Products...' }}
				filters={filters}
				buttonActions={buttonActions}
				rowIds={rowIds}
				format={appLocalizer.date_format}
				currency={{
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position,
				}}
			/>
		</>
	);
};

export default ProductReport;
