import React, { useState } from 'react';
import '../common.scss';
import { __ } from '@wordpress/i18n';
import {
	InfoItem,
	NavigatorHeader,
	PopupUI,
	TableCard,
} from 'zyra';
import { applyFilters } from '@wordpress/hooks';

import ShowProPopup from '../Popup/Popup';
import { dummyQuotes } from './QuoteRequests';

export interface QuoteRow {
	id?: number;
	order_id?: string;
	date?: string;
	status?: string;
	total?: string;
	action?: string;
}

export default function QuotesList() {
	const [openPopup, setopenPopup] = useState(false);

	// Define table headers
	const headers = {
	order_id: {
		label: __('Order ID', 'catalogx'),
		render: (row: QuoteRow) => (
			<InfoItem
				title={row.order_id}
				avatar={{ iconClass: 'quote' }}
			/>
		),
	},

	date: {
		label: __('Date', 'catalogx'),
		render: (row: QuoteRow) => (
			<>{row.date || '-'}</>
		),
	},

	status: {
		label: __('Status', 'catalogx'),
		render: (row: QuoteRow) => (
			<span className={`order-status ${row.status?.toLowerCase()}`}>
				{row.status || '-'}
			</span>
		),
	},

	total: {
		label: __('Total', 'catalogx'),
		render: (row: QuoteRow) => (
			<>{row.total || '-'}</>
		),
	},

	action: {
		type: 'action',
		label: __('Action', 'catalogx'),

		actions: [
			{
				label: __('View Order', 'catalogx'),
				icon: 'view',
				onClick: () => {
					setopenPopup(true);
				},
			},

			{
				label: __('Update Status', 'catalogx'),
				icon: 'refresh',
				onClick: () => {
					setopenPopup(true);
				},
			},
		],
	},
};

	const defaultTableProps = {
		headers,

		rows: dummyQuotes,
		totalRows: dummyQuotes.length,

		onQueryUpdate: () => {
			setopenPopup(true);
		},

		onBulkActionApply: () => {
			setopenPopup(true);
		},

		search: {
			placeholder: __('Search quotes...', 'catalogx'),
		},
	};

	const RenderedTableCard = applyFilters(
        'catalogx_quote_table_component',
        TableCard
    );

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
				headerIcon="quote"
				headerDescription={__(
					'Quote requests are displayed with customer details, totals, and statuses to support sales and order management workflows.',
					'catalogx'
				)}
				headerTitle={__('Quote Requests', 'catalogx')}
			/>

			<div>
				<RenderedTableCard {...defaultTableProps} />
			</div>
		</>
	);
}