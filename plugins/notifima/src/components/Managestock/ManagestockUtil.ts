import { __ } from "@wordpress/i18n";

export const dummyProducts = [
	{
		link: 'http://localhost:8888/product/variable-product/',
		id: 19,
		sku: '-',
		name: 'variable product',
		type: 'Variable',
		sale_price: '',
		backorders: 'no',
		manage_stock: false,
		stock_status: 'outofstock',
		regular_price: '',
		stock_quantity: null,
		image:
			'http://localhost:8888/wp-content/uploads/woocommerce-placeholder.webp',
		subscriber_no: '',
		variation: [
			{
				link:
					'http://localhost:8888/product/variable-product/?attribute_group=A',
				id: 20,
				sku: '-',
				name: 'variable product - A',
				type: 'Variation',
				sale_price: '',
				backorders: 'no',
				manage_stock: false,
				stock_status: 'outofstock',
				regular_price: '77',
				stock_quantity: null,
				image:
					'http://localhost:8888/wp-content/uploads/woocommerce-placeholder.webp',
				subscriber_no: '',
				parent_product_id: 19,
			},
			{
				link:
					'http://localhost:8888/product/variable-product/?attribute_group=B',
				id: 21,
				sku: '-',
				name: 'variable product - B',
				type: 'Variation',
				sale_price: '',
				backorders: 'no',
				manage_stock: true,
				stock_status: 'outofstock',
				regular_price: '',
				stock_quantity: 0,
				image:
					'http://localhost:8888/wp-content/uploads/woocommerce-placeholder.webp',
				subscriber_no: '',
				parent_product_id: 19,
			},
			{
				link:
					'http://localhost:8888/product/variable-product/?attribute_group=C',
				id: 22,
				sku: '-',
				name: 'variable product - C',
				type: 'Variation',
				sale_price: '',
				backorders: 'no',
				manage_stock: true,
				stock_status: 'outofstock',
				regular_price: '',
				stock_quantity: 0,
				image:
					'http://localhost:8888/wp-content/uploads/woocommerce-placeholder.webp',
				subscriber_no: '',
				parent_product_id: 19,
			},
		],
	},
	{
		link: 'http://localhost:8888/product/test-product-three/',
		id: 18,
		sku: '-',
		name: 'test product three',
		type: 'Simple',
		sale_price: '45',
		backorders: 'no',
		manage_stock: true,
		stock_status: 'outofstock',
		regular_price: '777',
		stock_quantity: 0,
		image:
			'http://localhost:8888/wp-content/uploads/woocommerce-placeholder.webp',
		subscriber_no: '0',
	},
	{
		link: 'http://localhost:8888/product/test-product-two/',
		id: 17,
		sku: '-',
		name: 'test product two',
		type: 'Simple',
		sale_price: '',
		backorders: 'no',
		manage_stock: false,
		stock_status: 'outofstock',
		regular_price: '71',
		stock_quantity: null,
		image:
			'http://localhost:8888/wp-content/uploads/woocommerce-placeholder.webp',
		subscriber_no: '1',
	},
	{
		link: 'http://localhost:8888/product/test-product/',
		id: 13,
		sku: '-',
		name: 'test product',
		type: 'Simple',
		sale_price: '',
		backorders: 'no',
		manage_stock: false,
		stock_status: 'outofstock',
		regular_price: '76',
		stock_quantity: null,
		image:
			'http://localhost:8888/wp-content/uploads/woocommerce-placeholder.webp',
		subscriber_no: '0',
	},
];

export const defaultCategoryCounts = [
    {
        value: 'all',
        label: __('All', 'catalogx-pro'),
        count: 4,
    },
    {
        value: 'instock',
        label: __('In Stock', 'catalogx-pro'),
        count: 0,
    },
    {
        value: 'onbackorder',
        label: __('On Backorder', 'catalogx-pro'),
        count: 0,
    },
    {
        value: 'outofstock',
        label: __('Out of Stock', 'catalogx-pro'),
        count: 4,
    },
];