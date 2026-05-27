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
import { dummyQuotes } from './QuoteRequests';

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
					title={row.order_id}
					avatar={{
						// image: row.image?.src || '',
						iconClass: 'quote',
					}}
					descriptions={[
						{
							label: __('By', 'catalogx'),
							value: row.customer_name || '—',
						},
					]}
				/>
			),
		},
		date: { label: __('Date', 'multivendorx'), type: 'date' },		
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
					label: __('Edit Status', 'catalogx'),
					icon: 'edit',
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
	const filterOptions = [
		{ value: 'Order ID', label: __('Order ID', 'catalogx') },
		{ value: 'Customer Name', label: __('Customer Name', 'catalogx') },
		{ value: 'Customer Email', label: __('Customer Email', 'catalogx') },
	];

	const filters = [
		{
			key: 'filter',
			label: __('Filter', 'catalogx'),
			type: 'select',
			options: filterOptions,
		},
		{
			key: 'date_range',
			label: __('Date Range', 'catalogx'),
			type: 'date',
		},
	];
	const defaultTableProps = {
		headers,

		rows: dummyQuotes,
		totalRows: dummyQuotes.length,
		filters: filters,
		search: {
			placeholder: __('Search quotes...', 'catalogx'),
		},
	};

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
					</div>
				</Column>
			</Container>
		</>
	);
}