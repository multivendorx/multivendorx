import { useState } from 'react';
import {
    Column,
    Container,
    InfoItem,
    NavigatorHeader,
    PopupUI,
    TableCard,
    MultiCheckBoxUI
} from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { defaultCategoryCounts, dummyProducts } from './ManagestockUtil';


const Managestock = () => {
    const [openPopup, setopenPopup] = useState(false);
    let tableProps: any = {};
    const headers = {
        product: {
            label: __('Product', 'notifima'),
            render: (row) => (
                <InfoItem
                    title={row.name}
                    avatar={{
                        image: row.image || '',
                        iconClass: row.image ? '' : 'single-product',
                    }}
                />
            ),
        },

        sku: {
            label: __('SKU', 'notifima'),
        },

        type: {
            label: __('Type', 'notifima'),
            type: 'status',
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
                <MultiCheckBoxUI
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
                        setopenPopup(true);
                    }}
                />
            ),
        },
        stock_status: {
            label: __('Stock Status', 'notifima'),
            type: 'status'
        },
        backorders: {
            label: __('Backorders', 'notifima'),
        },
        stock: {
            label: __('Stock', 'notifima'),
        },
        subscriber_no: {
            label: __('Subscriber No', 'notifima'),
        },
    };

    const buttonActions = [
        {
            label: __('Download CSV', 'notifima'),
            icon: 'download',
            onClickWithQuery: () => setopenPopup(true),
        },
    ];

    const filters = [
        {
            key: 'product_type',
            label: __('Product Type', 'notifima'),
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
        onQueryUpdate: () => setopenPopup(false),
        search: {
            placeholder: __('Search...', 'notifima'),
            size: 8,
            options: [
                {
                    label: __('Select', 'notifima'),
                    value: '',
                },
                {
                    label: __('product Name', 'notifima'),
                    value: 'name',
                },
                {
                    label: __('Email', 'notifima'),
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
                <div onClick={() => setopenPopup(true)}>
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
                <PopupUI
                    position="lightbox"
                    open={openPopup}
                    onClose={() => setopenPopup(false)}
                    width={31.25}
                    height="auto"
                >
                    <ShowProPopup />
                </PopupUI>
            )}
            <NavigatorHeader
                headerIcon="boxes"
                headerDescription={__(
                    'Manage product inventory, monitor stock availability, and update stock settings for simple and variable products.',
                    'notifima'
                )}
                headerTitle={__('Manage Stock', 'notifima')}
            />
            <Container general>
                <Column>
                    {renderTableContent()}
                </Column>
            </Container>
        </>
    );
};

export default Managestock;