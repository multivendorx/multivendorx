import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
    getApiLink,
    Container,
    Column,
    TableCard,
    TableRow,
    QueryProps,
    InfoItem,
    ButtonInputUI,
} from 'zyra';

interface VerificationRow {
    id: string;
    store_id: number;
    store_name: string;
    type: string;
    document_url: string;
    status: string;
    created_at: string;
}

const PendingVerification: React.FC<{ setCount?: (count: number) => void }> = ({
    setCount,
}) => {
    const [rows, setRows] = useState<TableRow[][]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState<number>(0);

    // ✅ TABLE HEADERS
    const headers = {
        store: {
            label: __('Store', 'multivendorx'),
            render: (row: VerificationRow) => (
                <InfoItem
                    title={row.store_name}
                    descriptions={[
                        { label: 'Store ID', value: row.store_id },
                    ]}
                />
            ),
        },
        type: {
            label: __('Document Type', 'multivendorx'),
        },
        document_url: {
            label: __('Document', 'multivendorx'),
            render: (row: VerificationRow) => (
                <a href={row.document_url} target="_blank">
                    {__('View Document', 'multivendorx')}
                </a>
            ),
        },
        status: {
            label: __('Status', 'multivendorx'),
            render: (row: VerificationRow) => (
                <span
                    className={`status-badge status-${row.status}`}
                >
                    {row.status}
                </span>
            ),
        },
        created_at: {
            label: __('Submitted On', 'multivendorx'),
            type: 'date',
        },
        action: {
            type: 'action',
            label: __('Action', 'multivendorx'),
            render: (row: VerificationRow) => {
				return (
					<ButtonInputUI
						buttons={[
							{
								icon: 'check',
								text: __('Approve', 'multivendorx'),
                                color: 'green',
								onClick: () => {
                                    updateStatus(row, 'approved');
                                },
							},
							{
								icon: 'close',
								text: __('Reject', 'multivendorx'),
								color: 'red',
								onClick: () => {
                                    updateStatus(row, 'rejected');
                                },
							},
						]}
					/>
				);
			},
        },
    };

    // ✅ UPDATE STATUS API
    const updateStatus = (row: VerificationRow, status: string) => {
        axios.post(
            getApiLink(appLocalizer, 'verification') + '?action=update_status',
            {
                store_id: row.store_id,
                type: row.type,
                status,
            },
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        ).then(() => {
            doRefreshTableData({});
        });
    };

    // ✅ FETCH DATA
    const doRefreshTableData = (query: QueryProps) => {
        setIsLoading(true);

        axios
            .get(getApiLink(appLocalizer, 'verification') + '?action=requests', {
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce,
                },
                params: {
                    page: query.paged,
                    per_page: query.per_page,
                },
            })
            .then((response) => {
                const data = response.data || [];

                setRows(data);
                setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setCount?.(Number(response.headers['x-wp-total']) || 0);
                setIsLoading(false);
                
                console.log('Fetched verification requests:', Number(response.headers['x-wp-total']));
            })
            .catch(() => {
                setRows([]);
                setTotalRows(0);
                setIsLoading(false);
            });
    };

    return (
        <Container>
            <Column>
                <TableCard
                    headers={headers}
                    rows={rows}
                    totalRows={totalRows}
                    isLoading={isLoading}
                    onQueryUpdate={doRefreshTableData}
                />
            </Column>
        </Container>
    );
};

export default PendingVerification;