import React, { useState } from 'react';
import axios from 'axios';

import { TableCard } from 'zyra';

type FilterValue = string | string[] | { startDate: Date; endDate: Date };

type QueryProps = {
	orderby?: string;
	order?: string;
	page?: string;
	per_page?: number;
	paged?: number | string;
	filter?: Record<string, FilterValue>;
	categoryFilter?: string;
};

 type TableHeader = {
	defaultSort?: boolean;
	defaultOrder?: string;
	isLeftAligned?: boolean;
	isNumeric?: boolean;
	isSortable?: boolean;
	key: string;
	label?: React.ReactNode;
	required?: boolean;
	screenReaderLabel?: string;
	cellClassName?: string;
	visible?: boolean;
};

type TableRow = {
	display?: React.ReactNode;
	value?: string | number | boolean;
};
/**
 * Table headers
 */
const headers: TableHeader[] = [
	{
		key: 'name',
		label: 'Product',
		isSortable: true,
		isLeftAligned: true,
		defaultSort: true,
	},
	{
		key: 'sku',
		label: 'SKU',
		isSortable: true,
	},
	{
		key: 'price',
		label: 'Price',
		isSortable: true,
		isNumeric: true,
	},
	{
		key: 'sales',
		label: 'Total Sales',
		isSortable: true,
		isNumeric: true,
	},
	{
		key: 'status',
		label: 'Status',
	},
];

const TableCardDemo: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const fetchData = async (query: QueryProps) => {
		setIsLoading(true);

		try {
			// Base params for API
			const params: Record<string, any> = {
				meta_key: 'multivendorx_store_id',
				per_page: query.per_page,
				page: query.paged,
				orderby: query.orderby,
				order: query.order,
			};

			// Add filters dynamically (only non-empty values)
			if (query.filter) {
				for (const [key, value] of Object.entries(query.filter)) {
					if (value || (Array.isArray(value) && value.length > 0)) {
						params[key] = value;
					}
				}
			}

			// Fetch data from WooCommerce
			const response = await axios.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params,
			});

			// Map API response into TableRow[][]
			const mappedRows: TableRow[][] = response.data.map((product: any) => [
				{ display: <a href={`/wp-admin/post.php?post=${product.id}&action=edit`} target="_blank" rel="noopener noreferrer">{product.name}</a>, value: product.id },
				{ display: product.sku || '—', value: product.sku || '' },
				{ display: `$${product.price}`, value: Number(product.price) },
				{ display: product.total_sales, value: product.total_sales },
				{ display: product.status, value: product.status },
			]);

			setRows(mappedRows);
			setTotalRows(Number(response.headers['x-wp-total']) || 0);
		} catch (error) {
			console.error('Failed to fetch table data', error);
			setRows([]);
			setTotalRows(0);
		} finally {
			setIsLoading(false);
		}
	};


	const filters = [
		{
			key: 'status',
			label: 'Status',
			type: 'select',           // single select
			options: [
				{ label: 'Published', value: 'publish' },
				{ label: 'Draft', value: 'draft' },
			],
		},
		{
			key: 'category',
			label: 'Category',
			type: 'select',
			multiple: true,           // multi-select
			options: [
				{ label: 'Books', value: 'books' },
				{ label: 'Music', value: 'music' },
			],
		},
		{
			key: 'created_at',          // date filter
			label: 'Created Date',
			type: 'date',
		},
	];


	return (
		<div style={{ padding: 20 }}>
			<h1>TableCard API Demo</h1>

			<TableCard
				title="Revenue Report"
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={fetchData}
				tablePreface={
					<div>
						Data loaded from WooCommerce REST API.
					</div>
				}
				ids={rows.map((row, i) => String(row[0]?.value))}
				bulkActions={[
					{ label: 'Delete Selected', value: 'delete' },
					{ label: 'Mark as Featured', value: 'feature' },
				]}
				onBulkActionApply={(action: string, selectedIds: []) => {
					console.log('Action:', action, 'Selected IDs:', selectedIds);
					// Perform your API call or state update here
				}}
				search={{
					placeholder: 'Search Products...',
					options: [
						{ label: 'All', value: '' },
						{ label: 'Published', value: 'publish' },
						{ label: 'Draft', value: 'draft' },
					],
				}}
				filters={filters}
				categoryCounts={[
					{ label: 'All', value: 'all', count: 15 },
					{ label: 'Published', value: 'publish', count: 10 },
					{ label: 'Draft', value: 'draft', count: 5 },
					{ label: 'Trash', value: 'trash', count: 0 }
				]}
				activeCategory="all"
			/>
		</div>
	);
};

export default TableCardDemo;
