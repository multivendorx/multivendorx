import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, TableCard } from 'zyra';

import { truncateText } from '@/services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

const AnnouncementsTable = (React.FC = () => {
    const [rows, setRows] = useState<TableRow[][]>([]);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);


    const headers = {
        title: {
            label: __('Title', 'multivendorx'),
        },
        content: {
            label: __('Content', 'multivendorx'),
        },
        status: {
            label: __('Status', 'multivendorx'),
            type:'status'
        },
        date_created: {
            label: __('Date', 'multivendorx'),
            type:'date'
        },
    };
    const doRefreshTableData = (query: QueryProps) => {
        setIsLoading(true);

        axios
            .get(getApiLink(appLocalizer, 'announcement'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce, withCredentials: true },
                params: {
                    page: query.paged,
                    row: query.per_page,
                    status: 'publish',
                    store_id: appLocalizer?.store_id,
                },
            })
            .then((response) => {
                const items = response.data || [];
                setRows(items);
                setTotalRows(Number(response.headers['x-wp-total']) || 0);
                setIsLoading(false);
            })
            .catch(() => {
                setRows([]);
                setTotalRows(0);
                setIsLoading(false);
            });
    };


    return (
        <>
            <TableCard
                headers={headers}
                rows={rows}
                totalRows={totalRows}
                isLoading={isLoading}
                onQueryUpdate={doRefreshTableData}
                format={appLocalizer.date_format}
            />
        </>
    );
});

export default AnnouncementsTable;
