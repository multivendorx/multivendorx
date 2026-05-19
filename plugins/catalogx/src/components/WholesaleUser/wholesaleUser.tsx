import React, { useState } from 'react';

import '../common.scss';

import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

import {
	InfoItem,
	NavigatorHeader,
	PopupUI,
	TableCard,
} from 'zyra';

import ShowProPopup from '../Popup/Popup';

import { dummyWholesaleUsers } from './WholesaleUser';

export interface WholesaleUserRow {
	id?: number;
	user?: string;
	user_email?: string;
	status?: string;
	date?: string;
	action?: string;
}

const WholesaleUser = () => {
	const [openPopup, setopenPopup] = useState(false);

	const headers = {
		user: {
			label: __('User', 'catalogx'),

			render: (row: WholesaleUserRow) => (
				<InfoItem
					title={row.user}
					description={row.user_email}
					avatar={{
						iconClass: 'wholesale',
					}}
				/>
			),
		},

		status: {
			label: __('Status', 'catalogx'),

			render: (row: WholesaleUserRow) => (
				<span
					className={`wholesale-status ${row.status
						?.toLowerCase()
						.replace(/\s+/g, '-')}`}
				>
					{row.status || '-'}
				</span>
			),
		},

		date: {
			label: __('Date', 'catalogx'),

			render: (row: WholesaleUserRow) => (
				<>{row.date || '-'}</>
			),
		},

		action: {
			type: 'action',

			label: __('Action', 'catalogx'),

			actions: [
				{
					label: __('View User', 'catalogx'),

					icon: 'eye',

					onClick: () => {
						setopenPopup(true);
					},
				},

				{
					label: __('Approve User', 'catalogx'),

					icon: 'check',

					onClick: () => {
						setopenPopup(true);
					},
				},
			],
		},
	};

	const defaultTableProps = {
		headers,

		rows: dummyWholesaleUsers,

		totalRows:
			dummyWholesaleUsers.length,

		onQueryUpdate: () => {
			setopenPopup(true);
		},

		onBulkActionApply: () => {
			setopenPopup(true);
		},

		search: {
			placeholder: __(
				'Search wholesale users...',
				'catalogx'
			),
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
					onClose={() =>
						setopenPopup(false)
					}
					width={31.25}
					height="auto"
				>
					<ShowProPopup />
				</PopupUI>
			)}

			<NavigatorHeader
				headerIcon="wholesale"
				headerDescription={__(
					'Wholesale users are displayed with account details and statuses to help manage approvals and customer access.',
					'catalogx'
				)}
				headerTitle={__(
					'Wholesale Users',
					'catalogx'
				)}
			/>

			<div>
				<RenderedTableCard {...defaultTableProps} />
			</div>
		</>
	);
};

export default WholesaleUser;