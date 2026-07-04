/* global appLocalizer */
import { useState } from 'react';
import {
    Column,
    Container,
    InfoItem,
    NavigatorHeader,
    PopupUI,
    TableCard,
    getApiLink
} from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { defaultCategoryCounts, subscriptions } from './SubscribersListUtil';
import axios from 'axios';

interface HeaderColumn {
    label: string;
    csvDisplay?: boolean;
    [key: string]: unknown;
}

interface HeaderConfig {
    [key: string]: HeaderColumn;
}

interface RowData {
    [key: string]: string | number | boolean | null | undefined;
}
export const formatLocalDate = (date?: Date) =>
    date ? date.toISOString().split('T')[0] : '';

export const downloadCSV = (
    headers: HeaderConfig,
    rows: RowData[],
    filename: string = 'export.csv'
) => {
    if (!rows || rows.length === 0) {
        return;
    }

    // Only include headers with csv: true
    const csvColumns = Object.entries(headers)
        .filter(([_, h]) => h.csvDisplay !== false)
        .map(([key, h]) => ({ key, label: h.label }));

    // Header row
    const csvRows = [csvColumns.map((c) => `"${c.label}"`).join(',')];

    // Data rows
    rows.forEach((row) => {
        const rowData = csvColumns
            .map((col) => {
                const value = row[col.key];
                return `"${value != null ? value : ''}"`;
            })
            .join(',');
        csvRows.push(rowData);
    });

    // Trigger download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

const SubscribersList = () => {
    const [openPopup, setopenPopup] = useState(false);
    let tableProps: any = {};
    const headers = {
        product: {
            label: __('Product', 'notifima'),
            render: (row) => (
                <InfoItem
                    title={row.product}
                    avatar={{
                        iconClass: 'single-product',
                    }}
                    descriptions={[
                        {
                            label: __('SKU', 'notifima'),
                            value: row.sku,
                        },
                    ]}
                />
            ),
        },
        email: {
            label: __('Email', 'notifima'),
            render: (row) => {
                return (
                    <div className="icon-wrapper"><i className='adminfont-mail yellow'></i>{row.email}</div>
                );
            },
        },
        date: { label: __('Date', 'notifima') },
        status: {
            label: __('Status', 'notifima'),
            statusClass: (row) => `${row.status_key}`,
            type: 'status',
        },
    };

    const downloadCSVByQuery = () => {
        // Call the API
        axios
            .get(getApiLink(appLocalizer, 'subscribers'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { export: true },
            })
            .then((response) => {
                const rows = response.data || [];

                downloadCSV(
                    headers,
                    rows,
                    'subscriber.csv'
                );
            })
            .catch((error) => {
                console.error('CSV download failed:', error);
            });
    };

    const filters = [
        {
            key: 'created_at',
            label: 'Created Date',
            type: 'date',
        },
    ];

    const defaultTableProps = {
        headers,
        categoryCounts: defaultCategoryCounts,
        filters,
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
                    value: 'product_name',
                },
                {
                    label: __('Email', 'notifima'),
                    value: 'email',
                },
            ],
        },
        rows: subscriptions,
        totalRows: subscriptions.length,
    };

    tableProps = applyFilters(
        'notifima_subscriber_list_table_props',
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
                headerIcon="subscriber"
                headerDescription={__(
                    'Manage product subscription requests, track subscriber statuses, and monitor email notifications sent to interested customers.',
                    'notifima'
                )}
                headerTitle={__('Subscribers', 'notifima')}
                buttons={[
                    {
                        label: __('Download CSV', 'notifima'),
                        icon: 'download',
                        onClick: downloadCSVByQuery,
                    },
                ]}
            />
            <Container general>
                <Column>
                    {renderTableContent()}
                </Column>
            </Container>
        </>
    );
};

export default SubscribersList;