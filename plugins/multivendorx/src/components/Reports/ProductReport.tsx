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
import { Analytics, Card, Column, Container, getApiLink, InfoItem, MessageState, MultiCalendarInput, Table, TableCell } from 'zyra';
import axios from 'axios';
import {
	PaginationState,
	RowSelectionState,
	ColumnDef,
} from '@tanstack/react-table';
import { formatCurrency } from '../../services/commonFunction';
type ProductRow = {
	id: number;
	title: string;
	sku: string;
	itemsSold: number;
	netSales: string;
	orders: number;
	category: string;
	stock: string;
	dateCreated: string;
};

type FilterData = {
	searchField?: string;
	store_id?: string;
	orderBy?: string;
	order?: string;
	date?: { start_date?: Date; end_date?: Date };
};

type ToggleState = { [key: string]: boolean };

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => React.ReactNode;
}

const ProductReport: React.FC = () => {
	const [data, setData] = useState<ProductRow[]>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pageCount, setPageCount] = useState<number>(0);
	const [store, setStore] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [toReviewedProduct, setToReviewedProduct] = useState<any[]>([]);
	const [toSellingProduct, setToSellingProduct] = useState<any[]>([]);
	const [openReviewedCards, setOpenReviewedCards] = useState<ToggleState>({});
	const [chartData, setChartData] = useState<any[]>([]);
	const [inStockCount, setInStockCount] = useState(0);
	const [outOfStockCount, setOutOfStockCount] = useState(0);
	const [onBackorderCount, setOnBackorderCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	

	const toggleReviewedCard = (key: string) => {
		setOpenReviewedCards((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const Counter = ({ value, duration = 1200 }) => {
		const [count, setCount] = React.useState(0);

		React.useEffect(() => {
			let start = 0;
			const end = parseInt(value);
			if (start === end) {
				return;
			}

			const increment = end / (duration / 16);

			const timer = setInterval(() => {
				start += increment;
				if (start >= end) {
					start = end;
					clearInterval(timer);
				}
				setCount(Math.floor(start));
			}, 16);

			return () => clearInterval(timer);
		}, [value, duration]);

		return <>{count}</>;
	};

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// 1. Fetch store list
				axios
					.get(getApiLink(appLocalizer, 'store'), {
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
					})
					.then((response) => setStore(response.data.stores || []))
					.finally(() => {setIsLoading(false);})
					.catch(() => {
						setError(__('Failed to load stores', 'multivendorx'));
						setStore([]);
					});

				// 2. Total rows
				axios({
					method: 'GET',
					url: `${appLocalizer.apiUrl}/wc/v3/products`,
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: { meta_key: 'multivendorx_store_id', per_page: 1 },
				})
					.then((response) => {
						const total =
							Number(response.headers['x-wp-total']) || 0;
						setTotalRows(total);
						setPageCount(Math.ceil(total / pagination.pageSize));
					})
					.finally(() => {setIsLoading(false);})
					.catch(() =>
						setError(
							__('Failed to load total rows', 'multivendorx')
						)
					);

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
					.finally(() => {setIsLoading(false);})
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
					.finally(() => {setIsLoading(false);})
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
					.finally(() => {setIsLoading(false);})
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
					    .finally(() => {setIsLoading(false);})
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

		fetchData();
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

	//Fixed table columns for WooCommerce products
	const columns: ColumnDef<ProductRow>[] = [
		{
			header: __('Product', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					<a
						href={`${appLocalizer.site_url}/wp-admin/post.php?post=${row.original.id}&action=edit`}
						target="_blank"
						className="product-wrapper"
					>
						{row.original.image ? (
							<img
								src={row.original.image}
								alt={row.original.store_name}
							/>
						) : (
							<i className="item-icon adminfont-store-inventory"></i>
						)}
						<div className="details">
							<span className="title">{row.original.title}</span>
							<div className="des">{row.original.sku}</div>
						</div>
					</a>
				</TableCell>
			),
		},
		{
			header: __('Store', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.store_name}</TableCell>,
		},
		{
			header: __('Items sold', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.itemsSold}</TableCell>,
		},
		{
			header: __('Net sales', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.netSales}</TableCell>,
		},
		{
			header: __('Category', 'multivendorx'),
			cell: ({ row }) => <TableCell>{row.original.category}</TableCell>,
		},
		{
			id: 'date',
			accessorKey: 'date',
			enableSorting: true,
			header: __('Date Created', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>{row.original.dateCreated}</TableCell>
			),
		},
	];

	const requestData = async (
		rowsPerPage = 10,
		currentPage = 1,
		searchField = '',
		store_id = '',
		orderBy = '',
		order = '',
		startDate?: Date,
		endDate?: Date
	) => {
		try {
			setData([]);

			const params: any = {
				page: currentPage,
				per_page: rowsPerPage,
				meta_key: 'multivendorx_store_id',
				value: store_id,
				search: searchField,
			};

			//Add Date Filtering (only if both are valid Date objects)
			if (startDate instanceof Date && endDate instanceof Date) {
				if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
					// --- Date Construction and UTC Offset Logic ---

					// 1. Create Start Date (Start of Day in BROWSER's local time)
					const startLocal = new Date(
						startDate.getFullYear(),
						startDate.getMonth(),
						startDate.getDate(),
						0,
						0,
						0 // Time set to 00:00:00
					);

					// 2. Create End Date (End of Day in BROWSER's local time)
					const endLocal = new Date(
						endDate.getFullYear(),
						endDate.getMonth(),
						endDate.getDate() + 1, // Go to the next day
						0,
						0,
						0,
						0
					);
					endLocal.setMilliseconds(endLocal.getMilliseconds() - 1); // Back to 23:59:59.999

					// 3. Apply UTC+05:30 offset adjustment (5 hours, 30 minutes)
					// This is a common requirement when the server is in IST but the API only accepts UTC/Z-time.
					const offsetMinutes = 330; // 5 hours * 60 minutes + 30 minutes = 330

					// Calculate UTC equivalent of the server's 00:00:00 boundary.
					const afterDate = new Date(
						startLocal.getTime() -
						(startLocal.getTimezoneOffset() + offsetMinutes) *
						60000
					);

					// Calculate UTC equivalent of the server's 23:59:59 boundary.
					const beforeDate = new Date(
						endLocal.getTime() -
						(endLocal.getTimezoneOffset() + offsetMinutes) *
						60000
					);

					// 4. Convert to ISO String (UTC/Z-time)
					// Using the adjusted Date objects to produce the correct UTC string.
					params.after = afterDate.toISOString();
					params.before = beforeDate.toISOString();
				}
			}

			//Sorting
			if (orderBy) {
				params.orderby = orderBy;
				params.order = order || 'asc';
			}

			const response = await axios({
				method: 'GET',
				url: `${appLocalizer.apiUrl}/wc/v3/products`,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params,
			});

			// ... (rest of the code remains the same)
			const formattedData: ProductRow[] = response.data.map(
				(product: any) => ({
					id: product.id,
					title: product.name,
					sku: product.sku || '-',
					image: product.images?.[0]?.src || '',
					store_name: product.store_name,
					itemsSold: product.total_sales
						? parseInt(product.total_sales)
						: 0,
					netSales: product.price
						? formatCurrency(product.price)
						: '-',
					category:
						product.categories
							?.map((c: any) => c.name)
							.join(', ') || '-',
					dateCreated: product.date_created
						? new Date(product.date_created).toLocaleDateString(
							undefined,
							{
								year: 'numeric',
								month: 'short',
								day: '2-digit',
							}
						)
						: '-',
				})
			);

			setData(formattedData);
		} catch (error) {
			console.error('Product fetch failed:', error);
			const errorMessage =
				(error as any).response?.data?.message ||
				__('Failed to load product data', 'multivendorx');
			setError(errorMessage);
			setData([]);
		}
	};

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
		setPageCount(Math.ceil(totalRows / rowsPerPage));
	}, []);

	/**
	 * Realtime filter logic
	 */
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.searchField,
			filterData?.store_id,
			filterData?.orderBy,
			filterData?.order,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'store_id',
			render: (updateFilter, filterValue) => (
				<div className="group-field">
					<select
						name="store_id"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">
							{__('All Stores', 'multivendorx')}
						</option>
						{store.map((s: any) => (
							<option key={s.id} value={s.id}>
								{s.store_name.charAt(0).toUpperCase() +
									s.store_name.slice(1)}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'date',
			render: (updateFilter) => (
				<div className="right">
					<MultiCalendarInput
						onChange={(range: any) => {
							updateFilter('date', {
								start_date: range.startDate,
								end_date: range.endDate,
							});
						}}
					/>
				</div>
			),
		},
	];

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<div className="search-section">
					<input
						name="searchField"
						type="text"
						placeholder={__('Search', 'multivendorx')}
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					/>
					<i className="adminfont-search"></i>
				</div>
			),
		},
	];
	const actionButton: RealtimeFilter[] = [
		{
			name: 'actionButton',
			render: () => (
				<>
					<div className="admin-btn btn-purple-bg"><i className="adminfont-download"></i> Download CSV</div>
				</>
			),
		},
	];
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
						isLoading={isLoading}	
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
							<MessageState title={__('No product sales data found.', 'multivendorx')}/>
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
							<MessageState title={__('No reviewed products found.', 'multivendorx')}/>
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
							<MessageState title={__('No top selling products found.', 'multivendorx')}/>
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
			<Table
				data={data}
				columns={columns as ColumnDef<Record<string, any>, any>[]}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				defaultRowsPerPage={pagination.pageSize}
				pageCount={pageCount}
				pagination={pagination}
				onPaginationChange={setPagination}
				handlePagination={requestApiForData}
				perPageOption={[10, 25, 50]}
				realtimeFilter={realtimeFilter}
				searchFilter={searchFilter}
				totalCounts={totalRows}
				actionButton={actionButton}
			/>
		</>
	);
};

export default ProductReport;
