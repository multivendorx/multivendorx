import React, { useState } from 'react';
import '../common.scss';
import { __ } from '@wordpress/i18n';
import {
	Column,
	Container,
	InfoItem,
	NavigatorHeader,
	PopupUI,
	TableCard,
} from 'zyra';
import { applyFilters } from '@wordpress/hooks';

import ShowProPopup from '../Popup/Popup';
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

export default function QuotesList() {
	const [openPopup, setopenPopup] = useState(false);

	// Define table headers
	const headers = {
		order_id: {
			label: __('Order ID', 'catalogx'),
			render: (row: QuoteRow) => (
				<InfoItem
					title={`${row.order_id}`}
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
		status: { label: __('Status', 'catalogx'), type: 'status', statusClass: (row: QuoteRow) => `${row.status}` },
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
					icon: 'eye',
					onClick: () => {
						setopenPopup(true);
					},
				},
				{
					label: __('Send Mail', 'catalogx'),
					icon: 'mail',
					onClick: () => {
						setopenPopup(true);
					},
				},
			],
		},
	};

	const filters = [
		{
			key: 'date_range',
			label: __('Date Range', 'catalogx'),
			type: 'date',
		},
	];
	const defaultTableProps : any ={};

	const RenderedTableCard = applyFilters(
		'catalogx_quote_table_component',
		TableCard
	);

	const handleTableWrapperClick = () => {
		if (!appLocalizer.khali_dabba) {
			setopenPopup(true);
		}
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
				headerIcon="quote"
				headerDescription={__(
					'Quote requests are displayed with customer details, totals, and statuses to support sales and order management workflows.',
					'catalogx'
				)}
				headerTitle={__('Quote Requests', 'catalogx')}
			/>
			<Container general>
				<Column>
					<div onClick={handleTableWrapperClick} >
						<RenderedTableCard {...defaultTableProps} />
						{defaultTableProps.popup}
					</div>
				</Column>
			</Container>
		</>
	);
}