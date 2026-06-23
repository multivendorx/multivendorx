import { useState } from 'react';
import {
    Column,
    Container,
    InfoItem,
    NavigatorHeader,
    PopupUI,
    TableCard,
} from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
// import { defaultCategoryCounts, subscriptions } from './SubscribersListUtil';


const Managestock = () => {
    const [openPopup, setopenPopup] = useState(false);
    let tableProps: any = {};
    const headers = {
        product: {
            label: __('Product', 'notifima'),
            render: (row) => (
                <InfoItem
                    title={row.product}
                    avatar={{
                        image: row.image || '',
                        iconClass: row.image
                            ? ''
                            : 'single-product',
                    }}
                />
            ),
        },
        email: { label: __('Email', 'notifima') },
        date: { label: __('Date', 'notifima') },
        status: {
            label: __('Status', 'notifima'),
            type: 'status',
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
            key: 'created_at',
            label: 'Created Date',
            type: 'date',
        },
    ];
    const defaultTableProps = {
        headers,
        buttonActions,
        // categoryCounts: defaultCategoryCounts,
        filters,
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
                    value: 'product_name',
                },
                {
                    label: __('Email', 'notifima'),
                    value: 'email',
                },
            ],
        },
        // rows: subscriptions,
        // totalRows: subscriptions.length,
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