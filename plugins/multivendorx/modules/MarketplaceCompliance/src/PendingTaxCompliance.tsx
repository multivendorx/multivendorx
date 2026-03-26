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

interface TaxRow {
	id: string;
	store_id: number;
	store_name: string;
	type: string;
	label: string;
	document_url: string;
	status: string;
	created_at: string;

	// 🔥 ADD THESE
	section: string;
	original_data: any;
}

const PendingTaxCompliance: React.FC<{ setCount?: (count: number) => void }> = ({
	setCount,
}) => {
	const [rows, setRows] = useState<TableRow[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);

	// ✅ TABLE HEADERS
	const headers = {
		store: {
			label: __('Store', 'multivendorx'),
			render: (row: TaxRow) => (
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
			render: (row: TaxRow) => row.label || row.type,
		},
		document_url: {
			label: __('Document', 'multivendorx'),
			render: (row: TaxRow) => (
				<a href={row.document_url} target="_blank">
					{__('View Document', 'multivendorx')}
				</a>
			),
		},
		status: {
			label: __('Status', 'multivendorx'),
			render: (row: TaxRow) => (
				<span className={`status-badge status-${row.status}`}>
                    {(row.status || 'pending').replaceAll('_', ' ')}
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
			render: (row: TaxRow) => (
				<ButtonInputUI
					buttons={[
						{
							icon: 'check',
							text: __('Approve', 'multivendorx'),
							color: 'green',
							onClick: () => updateStatus(row, 'approved'),
						},
						{
							icon: 'close',
							text: __('Reject', 'multivendorx'),
							color: 'red',
							onClick: () => updateStatus(row, 'rejected'),
						},
					]}
				/>
			),
		},
	};

	// ✅ UPDATE STATUS API
    const updateStatus = (row: TaxRow, status: string) => {
        // 🔥 Get full existing tax_compliance from row
        const updatedTaxCompliance = {
            ...(row.original_full_tax || {}), // full object
            [row.section]: {
                ...row.original_data,
                status,
            },
        };

        axios({
            method: 'POST',
            url: getApiLink(appLocalizer, `store/${row.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                tax_compliance: updatedTaxCompliance,
            },
        }).then(() => {
            doRefreshTableData({});
        });
    };

	// ✅ FETCH DATA
    const doRefreshTableData = (query: QueryProps) => {
        setIsLoading(true);

        axios
            .get(getApiLink(appLocalizer, 'store'), {
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce,
                },
                params: {
                    'approval_queue': true,
                    page: query.paged,
                    per_page: query.per_page,
                },
            })
            .then((response) => {
                console.log('STORE DATA:', response.data);
                const stores = response.data || [];

                // 🔥 Flatten tax compliance
                const flattenedRows: any[] = [];

                stores.forEach((store: any) => {
                    const tax =
                        typeof store.tax_compliance === 'object' &&
                            !Array.isArray(store.tax_compliance)
                            ? store.tax_compliance
                            : {};

                    Object.entries(tax).forEach(([section, data]: any) => {
                        if (!data || typeof data !== 'object') return;
                        if (!data.document_url) return;

                        flattenedRows.push({
                            id: `${store.id}-${section}`,
                            store_id: store.id,
                            store_name: store.store_name || store.name,
                            type: data.type,
                            label: data.label,
                            document_url: data.document_url,
                            status: 'pending',
                            created_at: data.created_at,
                            section,
                            original_data: data,
                            original_full_tax: tax,
                        });
                    });
                });

                setRows(flattenedRows);
                setTotalRows(flattenedRows.length);
                setCount?.(flattenedRows.length);
                setIsLoading(false);

                console.log('Flattened tax rows:', flattenedRows);
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

export default PendingTaxCompliance;