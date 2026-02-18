import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {  getApiLink, TableCard } from 'zyra';

import {  formatWordpressDate, truncateText } from '@/services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

const AnnouncementsTable = (React.FC = () => {
    const [rows, setRows] = useState<TableRow[][]>([]);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);


    const headers = [
        { key: 'title', label: 'Title' },
        { key: 'content', label: 'Content' },
        { key: 'status', label: 'Status' },
        { key: 'date', label: 'Date' },
    ];
    const fetchData = (query: QueryProps) => {
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
    
                const mappedRows: any[][] = items.map((ann: any) => [
                    { display: ann.title, value: ann.id },
                    {
                        display: truncateText(ann.content || '', 50),
                        value: ann.content || '',
                    },
                    { display: ann.status, value: ann.status },
                    {
                        display: formatWordpressDate(ann.date),
                        value: ann.date,
                    },
                ]);
    
                setRows(mappedRows);
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
                onQueryUpdate={fetchData}
                format={appLocalizer.date_format}
            />
        </>
    );
});

export default AnnouncementsTable;
