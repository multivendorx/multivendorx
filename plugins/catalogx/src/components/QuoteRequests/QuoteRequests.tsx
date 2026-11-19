import { useState } from 'react';
import {
    ColumnComponent,
    ContainerComponent,
    InformationItemComponent,
    NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard } from '@zyra/table';
import { type ProFeature, ProPopupDialog } from '../Popup/Popup';
import ListGate from '../Popup/ListGate';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { defaultCategoryCounts, dummyQuotes } from './QuoteRequestsUtil';
import { formatDate } from '../../services/commonFunction';
export interface QuoteRow {
    id?: number;
    order_id?: string;
    date?: string;
    status?: string;
    total?: string;
    action?: string;
    customer_name?: string;
}

/** This page, as the Pro card and the Pro popup name it. */
const FEATURE: ProFeature = {
    title: __('Quotation Requests', 'catalogx'),
    description: __(
        'Price every quote request, send it with an expiry date and PDF, and let the customer accept it online.',
        'catalogx'
    ),
    icon: 'quote',
};

const QuoteRequests = () => {
    const [openPopup, setopenPopup] = useState(false);
    let tableProps: any;
    const headers = {
        order_id: {
            label: __('Order', 'catalogx'),
            width: '50%',
            render: (row: QuoteRow) => (
                <InformationItemComponent
                    title={`#${row.order_id}`}
                    titleLink={row.order_url || ''}
                    avatar={{
                        iconClass: 'quote',
                    }}
                    descriptions={
                        [
                            {
                                label: __('By', 'catalogx'),
                                icon: 'person',
                                value: row.customer_name || '—',
                            },
                            {
                                icon: 'calendar',
                                label: __('Date', 'catalogx'),
                                value: formatDate(row.date),
                            },
                        ]}
                />
            ),
        },
        total: {
            label: __('Total', 'catalogx'),
            type: 'currency'
        },
        status: {
            label: __('Status', 'catalogx'),
            type: 'status',
            statusClass: (row: QuoteRow) => `${row.status}`
        },
        action: {
            label: __('Action', 'catalogx'),
            type: 'action',
            actions: [
                {
                    label: __('View', 'catalogx'),
                    icon: 'eye',
                    onClick: (_row: any) => setopenPopup(true),
                },
                {
                    label: __('Send Mail', 'catalogx'),
                    icon: 'mail',
                    onClick: (_row: any) => setopenPopup(true),
                },
            ],
        },
    };

    const buttonActions = [
        {
            label: __('Download CSV', 'catalogx'),
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
        format: appLocalizer.date_format,
        buttonActions,
        categoryCounts: defaultCategoryCounts,
        filters,
        currency: {
            currencySymbol: appLocalizer.currency_symbol,
            priceDecimals: appLocalizer.price_decimals,
            decimalSeparator: appLocalizer.decimal_separator,
            thousandSeparator: appLocalizer.thousand_separator,
            currencyPosition: appLocalizer.currency_position,
        },
        search: {
            placeholder: __('Search...', 'catalogx'),
            size: 8,
            options: [
                {
                    label: __('Select', 'catalogx'),
                    value: '',
                },
                {
                    label: __('Order ID', 'catalogx'),
                    value: 'order_id',
                },
                {
                    label: __('Customer Name', 'catalogx'),
                    value: 'customer_name',
                },
                {
                    label: __('Customer Email', 'catalogx'),
                    value: 'customer_email',
                },
            ],
        },
        rows: dummyQuotes,
        totalRows: dummyQuotes.length,
    };

    const { props: filteredProps, hasNoRecords } = useNoRecordsYet(
        applyFilters(
            'catalogx_quote_requests_table_props',
            defaultTableProps
        ) as typeof defaultTableProps & Record<string, any>
    );
    tableProps = filteredProps;

    /** The sample rows drawn behind every card: the plugin's own, never the filtered (real) props. */
    const sampleTable = (
        <TableCard
            {...defaultTableProps}
            rows={dummyQuotes.slice(0, 4)}
            totalRows={4}
        />
    );

    const quoteModuleOn = appLocalizer.active_modules.includes('quote');

    return (
        <>
            {openPopup && (
                <ProPopupDialog onClose={() => setopenPopup(false)} feature={FEATURE} moduleName="quote" />
            )}
            <NavigatorHeaderComponent
                headerIcon="quote"
                headerDescription={__(
                    'Quote requests are displayed with customer details, totals, and statuses to support sales and order management workflows.',
                    'catalogx'
                )}
                headerTitle={__('Quote Requests', 'catalogx')}
                buttons={appLocalizer.khali_dabba ? [
                    {
                        label: __('Add Quote', 'catalogx'),
                        icon: 'plus',
                        onClick: () => {
                            if (quoteModuleOn) {
                                window.location.assign(
                                    'admin-ajax.php?action=add_quote_from_adminend'
                                );
                            } else {
                                setopenPopup(true);
                            }
                        },
                    },
                ] : ''}
            />
            {tableProps.addingNewRule && (
                tableProps.addNewRuleForm
            )}
            <ContainerComponent general>
                <ColumnComponent>
                    <ListGate
                        feature={FEATURE}
                        module={{ id: 'quote', name: __('Quotation', 'catalogx') }}
                        sample={sampleTable}
                        isEmpty={hasNoRecords}
                        empty={{
                            heading: __('No quote requests yet', 'catalogx'),
                            description: __(
                                'When a customer adds products to a quote and sends it, the request lands here for you to price and reply to.',
                                'catalogx'
                            ),
                            actions: (
                                <>
                                    <a
                                        className="cx-locked-button"
                                        href="#&tab=settings&subtab=customer-engagement"
                                    >
                                        {__('Review the quote button', 'catalogx')}
                                    </a>
                                    <a
                                        className="cx-locked-link"
                                        href="admin-ajax.php?action=add_quote_from_adminend"
                                    >
                                        {__('Create a quote yourself', 'catalogx')}
                                    </a>
                                </>
                            ),
                            note: __(
                                'A preview with sample quotes. Yours show here once customers send them.',
                                'catalogx'
                            ),
                        }}
                    >
                        <TableCard {...tableProps} />
                        {tableProps.openMailPopup && tableProps.sendMail}
                    </ListGate>
                </ColumnComponent>
            </ContainerComponent>
        </>
    );
};

export default QuoteRequests;
