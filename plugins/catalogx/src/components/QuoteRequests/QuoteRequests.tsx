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
import { dummyQuotes } from './QuoteRequestsUtil';
export interface QuoteRow {
    id?: number;
    order_id?: string;
    date?: string;
    status?: string;
    total?: string;
    action?: string;
    customer_name?: string;
}

const QuoteRequests = () => {
    const [openPopup, setopenPopup] = useState(false);
    let tableProps: any = {};

    const headers = {
        order_id: {
            label: __('Order ID', 'catalogx'),
            render: (row: QuoteRow) => (
                <InfoItem
                    title={`#${row.order_id}`}
                    titleLink={row.order_url || ''}
                    descriptions={[
                        {
                            label: __('By', 'catalogx'),
                            value: row.customer_name || '—',
                        },
                    ]}
                />
            ),
        },
        date: { label: __('Date', 'catalogx'), type: 'date' },
        status: {
            label: __('Status', 'catalogx'),
            type: 'status',
        },
        total: {
            label: __('Total', 'catalogx'),
            type: 'currency'
        },
    };

    const defaultTableProps = {
        headers,
        format: appLocalizer.date_format,
        currency: {
            currencySymbol: appLocalizer.currency_symbol,
            priceDecimals: appLocalizer.price_decimals,
            decimalSeparator: appLocalizer.decimal_separator,
            thousandSeparator: appLocalizer.thousand_separator,
            currencyPosition: appLocalizer.currency_position,
        },
        rows: dummyQuotes,
        totalRows: dummyQuotes.length,
    };

    tableProps = applyFilters(
        'catalogx_quote_requests_table_props',
        defaultTableProps
    );

    const handleTableWrapperClick = () => {
        if (!appLocalizer.khali_dabba) {
            setopenPopup(true);
        }
    };


    return (
        <div>
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
                headerIcon="quote"
                headerDescription={__(
                    'Quote requests are displayed with customer details, totals, and statuses to support sales and order management workflows.',
                    'catalogx'
                )}
                headerTitle={__('Quote Requests', 'catalogx')}
                buttons={[
                    {
                        label: __('Add Quote', 'catalogx'),
                        icon: 'plus',
                        onClick: () => {
                            if (appLocalizer.khali_dabba) {
                                window.location.assign(
                                    'admin-ajax.php?action=add_quote_from_adminend'
                                );
                            } else {
                                setopenPopup(true);
                            }
                        },
                    },
                ]}
            />
            {tableProps.addingNewRule && tableProps.addingNewRule && (
                tableProps.addNewRuleForm
            )}
            <Container general>
                <Column>
                    <div onClick={handleTableWrapperClick}>
                        <TableCard {...tableProps} />
                        {tableProps.openMailPopup && tableProps.sendMail}
                    </div>
                </Column>
            </Container>
        </div>
    );
};

export default QuoteRequests;
