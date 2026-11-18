/* global appLocalizer */
import { getApiLink } from '@zyra/core';

import {
    ColumnComponent,
    ContainerComponent,
    InformationItemComponent,
    NavigatorHeaderComponent,
} from '@zyra/components';
import PreviewTable from '../Popup/PreviewTable';
import { __ } from '@wordpress/i18n';
import { csvHeaders, defaultCategoryCounts, subscriptions } from './SubscribersListUtil';
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

    // Exclude columns explicitly hidden from CSV.
    const csvColumns = Object.entries(headers)
        .filter(([, h]) => h.csvDisplay !== false)
        .map(([key, h]) => ({ key, label: h.label }));


    // Header row
    const csvRows = [csvColumns.map((column) => column.label).join(',')];
    
    // Data rows
    rows.forEach((row) => {
        const rowData = csvColumns
            .map((col) => {
                const value = row[col.key];
                return String(value ?? '');
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
    URL.revokeObjectURL(url);
};

/** The sample rows drawn behind a preview card: a few, as the preview fades out below them. */
const SAMPLE_ROWS = subscriptions.slice(0, 4);

const SubscribersList = () => {
    const headers = {
        product: {
            label: __('Product', 'notifima'),
            width: "70%",
            render: (row) => (
                <InformationItemComponent
                    title={row.product}
                    avatar={{
                        iconClass: 'single-product',
                    }}
                    descriptions={[
                        {
                            label: __('SKU', 'notifima'),
                            value: row.sku,
                        },
                        {
                            label: __('Email', 'notifima'),
                            value: row.email,
                        },
                        {
                            label: __('Phone', 'notifima'),
                            value: row.phone,
                        },
                    ]}
                    badges={[
                        {
                            text: row.status,
                            className: `badge-${row.status_key}`,
                        },
                    ]}
                />
            ),
        },
        date: {
            label: __('Date', 'notifima'),
            render: (row) => {
                return (
                    <>
                        <div className='table-details'>
                            <span className='label'>{__('Date:', 'notifima')}</span>
                            {row.date || '-'}
                        </div>
                    </>
                );
            },
        },
    };

    const downloadCSVByQuery = () => {
        // Call the API
        axios
            .get(getApiLink(appLocalizer, 'subscribers'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then((response) => {
                const rows = response.data || [];

                downloadCSV(
                    csvHeaders,
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
        hideHeader: true,
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

    const previewTable = (
        <PreviewTable
            defaultTableProps={defaultTableProps}
            filterHook="notifima_subscriber_list_table_props"
            sampleRows={SAMPLE_ROWS}
            proFeature={{
                title: __('Subscribers', 'notifima'),
                description: __(
                    'See every shopper waiting for a product, whether their back-in-stock email went out, and filter or export the list.',
                    'notifima'
                ),
                icon: 'subscriber',
            }}
            empty={{
                feature: {
                    title: __('Subscribers', 'notifima'),
                    description: __(
                        'Shoppers subscribe from the form on an out-of-stock product page. Each one shows here, with the product and whether they were notified.',
                        'notifima'
                    ),
                    icon: 'subscriber',
                },
                heading: __('No subscribers yet', 'notifima'),
                actions: (
                    <>
                        <a
                            className="nf-locked-button"
                            href="#&tab=settings&subtab=subscription-form-designer"
                        >
                            {__('Design the form', 'notifima')}
                        </a>
                        <a
                            className="nf-locked-link"
                            href="#&tab=settings&subtab=automation"
                        >
                            {__('Review automation', 'notifima')}
                        </a>
                    </>
                ),
                note: __(
                    'A preview with sample subscribers. Yours show here after the first signup.',
                    'notifima'
                ),
            }}
        />
    );

    return (
        <>
            <NavigatorHeaderComponent
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
            <ContainerComponent general>
                <ColumnComponent>
                    {previewTable}
                </ColumnComponent>
            </ContainerComponent>
        </>
    );
};

export default SubscribersList;