/* global appLocalizer */
import { useState } from 'react';

import { MultiCheckboxInput } from '@zyra/inputs';
import {
    ColumnComponent,
    ContainerComponent,
    InformationItemComponent,
    PopupComponent,
    NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard } from '@zyra/table';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { defaultCategoryCounts, dummyProducts } from './ManagestockUtil';


const Managestock = () => {
    const [openPopup, setOpenPopup] = useState(false);
    let tableProps: any = {};
    const headers = {
        product: {
            label: __('Product', 'notifima'),
            width: '35%',
            render: (row) => (
                <InformationItemComponent
                    title={row.name}
                    avatar={{
                        iconClass: 'single-product',
                    }}
                    descriptions={[
                        {
                            label: __('SKU', 'notifima'),
                            value: row.sku || '—',
                        },
                    ]}
                    badges={[
                        {
                            text: row.type,
                            className: `badge-${row.type?.toLowerCase()}`,
                        },
                        {
                            className: 'blue',
                            text: `${row.subscriber_no || 0} ${row.subscriber_no === 1 ? 'Subscriber' : 'Subscribers'
                                }`,
                        },
                    ]}
                />
            ),
        },

        regular_price: {
            label: __('Regular Price', 'notifima'),
        },
        sale_price: {
            label: __('Sale Price', 'notifima'),
        },
        manage_stock: {
            label: __('Manage Stock', 'notifima'),
            render: (row) => (
                <MultiCheckboxInput
                    look="toggle"
                    modules={[]}
                    options={[
                        {
                            key: `enabled-${row.id}`,
                            value: 'enabled',
                        },
                    ]}
                    value={row.manage_stock ? ['enabled'] : []}
                    onChange={() => {
                        setOpenPopup(true);
                    }}
                />
            ),
        },
        status: {
            label: __('Stock Status', 'notifima'),
            type: 'status',
            statusClass: (row) => `${row.status_class}`
        },
        backorders: {
            label: __('Backorders', 'notifima'),
        },
        stock_quantity: {
            label: __('Stock', 'notifima'),
        },
    };

    const buttonActions = [
        {
            label: __('Download CSV', 'notifima'),
            icon: 'download',
            onClickWithQuery: () => setOpenPopup(true),
        },
    ];

    const filters = [
        {
            key: 'product_type',
            label: __('Select Product Type', 'notifima'),
            type: 'select',
            options: [
                {
                    label: __('Simple', 'notifima'),
                    value: 'simple',
                },
                {
                    label: __('Variable', 'notifima'),
                    value: 'variable',
                },
            ],
        },
    ];

    const defaultTableProps = {
        headers,
        buttonActions,
        categoryCounts: defaultCategoryCounts,
        filters,
        expandable: true,
        expandText: 'View variations',
        expandedText: 'Viewing',
        search: {
            placeholder: __('Search...', 'notifima'),
            size: 8,
            options: [
                {
                    label: __('Select', 'notifima'),
                    value: '',
                },
                {
                    label: __('Product Name', 'notifima'),
                    value: 'name',
                },
                {
                    label: __('SKU', 'notifima'),
                    value: 'sku',
                },
            ],
        },
        rows: dummyProducts,
        totalRows: dummyProducts.length,
    };

    tableProps = applyFilters(
        'notifima_manage_stock_table_props',
        defaultTableProps
    );


    const renderTableContent = () => {
        if (!appLocalizer.khali_dabba) {
            return (
                <div className="demo-wrapper" onClick={() => setOpenPopup(true)}>
                    <div className="watermark">{__('This is sample Data', 'notifima')}</div>
                    <TableCard {...tableProps} />
                </div>
            );
        }

        return (
            <>
                <TableCard {...tableProps} />
            </>
        );
    };
    return (
        <>
            {openPopup && (
                <PopupComponent
                    position="lightbox"
                    open={openPopup}
                    onClose={() => setOpenPopup(false)}
                    width={31.25}
                    height="auto"
                >
                    <ShowProPopup />
                </PopupComponent>
            )}
            <NavigatorHeaderComponent
                headerIcon="store-analytics"
                headerDescription={__(
                    'Manage product inventory, monitor stock availability, and update stock settings for simple and variable products.',
                    'notifima'
                )}
                headerTitle={__('Manage Stock', 'notifima')}
            />
            <ContainerComponent general>
                <ColumnComponent>
                    {renderTableContent()}
                </ColumnComponent>
            </ContainerComponent>
        </>
    );
};

export default Managestock;