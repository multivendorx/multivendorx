import { useState } from 'react';

import {
	LayoutColumnComponent,
	ContainerComponent,
	InformationItemComponent,
	PopupComponent,
	ComponentStatusComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard } from '@zyra/table';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { defaultCategoryCounts, dummyQuotes } from './QuoteRequestsUtil';
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
                <InformationItemComponent
                    title={`${row.order_id}`}
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
            statusClass: (row: QuoteRow) => `${row.status}`
        },
        total: {
            label: __('Total', 'catalogx'),
            type: 'currency'
        },
        action: {
            label: __('Action', 'catalogx-pro'),
            type: 'action',
            actions: [
                {
                    label: __('View', 'catalogx-pro'),
                    icon: 'eye',
                    onClick: (row: any) => setopenPopup(true),
                },
                {
                    label: __('Send Mail', 'catalogx-pro'),
                    icon: 'mail',
                    onClick: (row: any) => setopenPopup(true),
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

    tableProps = applyFilters(
        'catalogx_quote_requests_table_props',
        defaultTableProps
    );


    const renderTableContent = () => {
        if (!appLocalizer.khali_dabba) {
            return (
                <div className="demo-wrapper" onClick={() => setopenPopup(true)}>
                    <div className="watermark">{__('This is sample Data','catalogx' )}</div>
                    <TableCard {...tableProps} />
                </div>
            );
        }

        if (!appLocalizer.active_modules.includes('quote')) {
            return (
                <ComponentStatusComponent
                    title={__(
                        'Looks like the Quote module isn’t enabled yet!',
                        'catalogx'
                    )}
                    desc={__(
                        'Enable the Quote module to start receiving and managing customer quote requests.',
                        'catalogx'
                    )}
                    buttonText={__('Enable Now', 'catalogx')}
                    buttonLink={`${appLocalizer.admin_url}#&tab=modules&module=quote`}
                />
            );
        }

        return (
            <>
                <TableCard {...tableProps} />
                {tableProps.openMailPopup && tableProps.sendMail}
            </>
        );
    };
    return (
        <>
            {openPopup && (
                <PopupComponent
                    position="lightbox"
                    open={openPopup}
                    onClose={() => setopenPopup(false)}
                    width={31.25}
                    height="auto"
                >
                    {!appLocalizer.khali_dabba ? (
                        <ShowProPopup />
                    ) : (
                        <ShowProPopup moduleName="quote" />
                    )}
                </PopupComponent>
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
                            if (appLocalizer.khali_dabba && appLocalizer.active_modules.includes('quote')) {
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
            { tableProps.addingNewRule && (
                tableProps.addNewRuleForm
            )}
            <ContainerComponent general>
                <LayoutColumnComponent>
                    {renderTableContent()}
                </LayoutColumnComponent>
            </ContainerComponent>
        </>
    );
};

export default QuoteRequests;