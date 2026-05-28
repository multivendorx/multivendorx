import React, { useState } from 'react';

import '../common.scss';

import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

import {
	Column,
	Container,
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
					descriptions={[
						{
							label: __('Email', 'catalogx'),
							value: row.user_email || '—',
						},
					]}
					avatar={{
						iconClass: 'person',
					}}
				/>
			),
		},
		status: { label: __('Status', 'catalogx'), type: 'status', statusClass: (row: WholesaleUserRow) => `${row.status}` },
		date: { label: __('Date', 'catalogx'), type: 'date' },
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
		filters:[
				{
					key: 'date_range',
					label: __('Date Range', 'catalogx'),
					type: 'date',
				},
			],
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
			<Container general>
				<Column>
				<div onClick={handleTableWrapperClick}>
					<RenderedTableCard {...defaultTableProps} />
				</div>
				</Column>
			</Container>
		</>
	);
};

export default WholesaleUser;