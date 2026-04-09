/* global appLocalizer */
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
	TableRow,
	QueryProps,
} from 'zyra';
import axios from 'axios';
import {
	downloadCSV,
	formatLocalDate,
	getUrl,
	toWcIsoDate,
} from '../../services/commonFunction';
import Counter from '@/services/Counter';
type ToggleState = { [key: string]: boolean };

interface Product {
	id: number;
	name: string;
	price: string;
	total_sales: string;
	average_rating: string;
	categories?: Array<{ id: number; name: string }>;
	images?: Array<{ src: string }>;
	price_html?: string;
	description?: string;
	stock_status?: string;
	store_name?: string;
	date_created?: string;
}
interface ChartDataItem {
	name: string;
	net_sales: number;
	items_sold: number;
}
interface Category {
	id: number;
	name: string;
}

const ProductReport: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [store, setStore] = useState([]);

	const [error, setError] = useState<string | null>(null);
	const [toReviewedProduct, setToReviewedProduct] = useState<Product[]>([]);
	const [toSellingProduct, setToSellingProduct] = useState<Product[]>([]);
	const [openReviewedCards, setOpenReviewedCards] = useState<ToggleState>({});
	const [chartData, setChartData] = useState<ChartDataItem[]>([]);
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
						const options = (response.data || []).map((store) => ({
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
							.filter(
								(product: Product) =>
									Number(product.total_sales) > 0
							)
							.map((product: Product) => ({
								name: product.name,
								net_sales:
									parseFloat(product.price || 0) *
									parseInt(product.total_sales || 0),
								items_sold: parseInt(product.total_sales || 0),
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
								(product: Product) =>
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
								(product: Product) =>
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
			render: (row) => {
				return (
					<InfoItem
						title={row.name}
						titleLink={getUrl(row.id, 'product') || ''}
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
						isLoading={isDashboardLoading}
					/>
				);
			},
		},
		store_name: {
			label: __('Store', 'multivendorx'),
			render: (row) => (
				<InfoItem
					title={row.store_name}
					titleLink={getUrl(row.store_id, 'store', 'edit')}
					avatar={{
						iconClass: 'store-inventory',
					}}
					isLoading={isDashboardLoading}
				/>
			),
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
			render: (row) =>
				row.categories?.map((cat) => cat.name).join(', ') || '-',
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

				const ids = products.map((product) => product.id);
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
		const params = {
			search: query.searchValue,
			orderby: 'popularity',
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

					<Card
						title={__('Revenue & Sales Comparison', 'multivendorx')}
					>
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
							toReviewedProduct.map(
								(product: Product, index: number) => (
									<InfoItem
										key={`selling-${product.id}`}
										title={product.name}
										avatar={{
											image: product.images?.[0]?.src,
											text:
												product.name?.charAt(0) || '?',
											iconClass: `admin-color${index + 1}`,
										}}
										amount={product.price}
										descriptions={[
											{
												label: __(
													'Total Sales:',
													'multivendorx'
												),
												value: product.total_sales || 0,
											},
										]}
										isLoading={isDashboardLoading}
									/>
								)
							)
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
								(product: Product, index: number) => (
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
										isLoading={isDashboardLoading}
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

			<TableCard
				headers={headers}
				rows={rows}
				title={__('Revenue Distribution', 'multivendorx')}
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
