// inventory/index.tsx

import { toWcIsoDate } from '@/services/commonFunction';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { CategoryCount, NavigatorHeader, QueryProps, TableCard } from 'zyra';

const InventoryView: React.FC = () => {
    const [rows, setRows] = useState<TableRow[][]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [rowIds, setRowIds] = useState<number[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<
        CategoryCount[] | null
    >(null);
    const headers = {
        name: {
            label: __('Product', 'multivendorx'),
        },

        sku: {
            label: __('SKU', 'multivendorx'),
            render: (row: any) => row.sku || __('-', 'multivendorx'),
        },

        type: {
            label: __('Type', 'multivendorx'),
            render: (row: any) =>
                row.type
                    ? row.type.charAt(0).toUpperCase() + row.type.slice(1)
                    : __('-', 'multivendorx'),
        },

        regular_price: {
            label: __('Regular Price', 'multivendorx'),
            type: 'currency',
            isEditable: true,
            editType: 'text',
        },

        sale_price: {
            label: __('Sale Price', 'multivendorx'),
            type: 'currency',
        },

        manage_stock: {
            label: __('Manage Stock', 'multivendorx'),
            isEditable: true,
            editType: 'toggle',
            options: [
                {
                    key: true,
                    value: true,
                }
            ],
        },

        stock_status: {
            label: __('Stock Status', 'multivendorx'),
            isEditable: true,
            editType: 'select',
            options: [
                { label: __('In stock', 'multivendorx'), value: 'instock' },
                { label: __('Out of stock', 'multivendorx'), value: 'outofstock' },
                { label: __('On backorder', 'multivendorx'), value: 'onbackorder' },
            ],
            render: (row: any) => {
                switch (row.stock_status) {
                    case 'instock':
                        return __('In stock', 'multivendorx');
                    case 'outofstock':
                        return __('Out of stock', 'multivendorx');
                    case 'onbackorder':
                        return __('On backorder', 'multivendorx');
                    default:
                        return row.stock_status || __('-', 'multivendorx');
                }
            },
        },

        backorders: {
            label: __('Backorders', 'multivendorx'),
            render: (row: any) => {
                switch (row.backorders) {
                    case 'no':
                        return __('No', 'multivendorx');
                    case 'notify':
                        return __('Allow, but notify customer', 'multivendorx');
                    case 'yes':
                        return __('Allow', 'multivendorx');
                    default:
                        return __('-', 'multivendorx');
                }
            },
        },

        stock_quantity: {
            label: __('Stock', 'multivendorx'),
            render: (row: any) =>
                row.manage_stock
                    ? row.stock_quantity ?? __('-', 'multivendorx')
                    : __('N/A', 'multivendorx'),
        }
    };
    const fetchStockCategoryCounts = async () => {
        try {
            const params = {
                meta_key: 'multivendorx_store_id',
                value: appLocalizer.store_id,
            };

            const endpoints = [
                { label: 'All', status: null },
                { label: 'In stock', status: 'instock' },
                { label: 'Out of stock', status: 'outofstock' },
                { label: 'On backorder', status: 'onbackorder' },
            ];

            const results = await Promise.allSettled(
                endpoints.map((item) =>
                    axios.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
                        headers: { 'X-WP-Nonce': appLocalizer.nonce },
                        params: {
                            ...params,
                            stock_status: item.status || undefined,
                            per_page: 1,
                            page: 1,
                        },
                    })
                )
            );

            const counts = results.map((res) =>
                res.status === 'fulfilled'
                    ? Number(res.value.headers['x-wp-total']) || 0
                    : 0
            );

            setCategoryCounts(
                endpoints.map((item, index) => ({
                    label: item.status
                        ? `${item.label}`
                        : 'All',
                    value: item.status || 'all',
                    count: counts[index],
                }))
            );

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStockCategoryCounts();
    }, []);

    const doRefreshTableData = (query: QueryProps) => {
        setIsLoading(true);
        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: {
                    page: query.paged || 1,
                    row: query.per_page || 10,
                    stock_status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
                    search: query.searchValue || '',
                    type: query.filter?.productType,
                    category: query.filter?.category,
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
                const ids = items
                    .filter((item: any) => item?.id != null)
                    .map((item: any) => item.id);

                setRowIds(ids);

                setRows(items);
                setTotalRows(Number(response.headers['x-wp-total']) || 0);
                setIsLoading(false);
            })
            .catch((error) => {
                setRows([]);
                setTotalRows(0);
                setIsLoading(false);
            });
    };
    const updateProductField = async (
        key: string,
        row: any,
        value: any
    ) => {
        const productId = row.id;

        setRows((prevRows: any[]) =>
            prevRows.map((item) =>
                item.id === productId
                    ? { ...item, [key]: value }
                    : item
            )
        );
        try {
            await axios.put(
                `${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
                {
                    [key]: value,
                },
                {
                    headers: { 'X-WP-Nonce': appLocalizer.nonce },
                }
            );
        } catch (error) {
            console.error('Update failed:', error);

            // Rollback on failure
            setRows((prevRows: any[]) =>
                prevRows.map((item) =>
                    item.id === productId
                        ? { ...item, [key]: row[key] }
                        : item
                )
            );
        }
    };

    return (
        <>
            <NavigatorHeader
                headerTitle={__('Inventory', 'multivendorx')}
                headerDescription={__(
                    'Everything you need to know about store operations',
                    'multivendorx'
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
                // filters={filters}
                format={appLocalizer.date_format}
                currency={{
                    currencySymbol: appLocalizer.currency_symbol,
                    priceDecimals: appLocalizer.price_decimals,
                    decimalSeparator: appLocalizer.decimal_separator,
                    thousandSeparator: appLocalizer.thousand_separator,
                    currencyPosition: appLocalizer.currency_position,
                }}
                onCellEdit={updateProductField}
            />
        </>
    );
};

export default InventoryView;