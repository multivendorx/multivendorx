import React, { useState } from 'react';

import '../common.scss';

import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { dummyWholesalecustomer } from './WholesaleUserUtil';

import {
	Column,
	Container,
	InfoItem,
	NavigatorHeader,
	PopupUI,
	TableCard,
} from 'zyra';

import ShowProPopup from '../Popup/Popup';

export interface WholesaleUserRow {
	id?: number;
	customer?: string;
	email?: string;
	status?: string;
	date?: string;
	action?: string;
}

const WholesaleUser = () => {
	const [openPopup, setopenPopup] = useState(false);
	let tableProps: any = {};

	const headers = {
		user: {
			label: __('User', 'catalogx'),
			render: (row: WholesaleUserRow) => (
				<InfoItem
					title={row.customer}
					titleLink={row.customer_url}
					descriptions={[
						{
							label: __('Email', 'catalogx'),
							value: row.email || '—',
						},
					]}
					avatar={{
						image: row.customer_img_url,
						iconClass: 'person',
					}}
				/>
			),
		},
		status: {
			label: __('Status', 'catalogx'),
			type: 'status'
		},
		date: {
			label: __('Date', 'catalogx'),
			type: 'date'
		},
	};


	const defaultTableProps = {
		headers,
        format: appLocalizer.date_format,
		rows: dummyWholesalecustomer,
		totalRows: dummyWholesalecustomer.length,
	};

	tableProps = applyFilters(
		'catalogx_wholesale_user_table_component',
		defaultTableProps
	);

	const handleTableWrapperClick = () => {
		if (!appLocalizer.khali_dabba) {
			setopenPopup(true);
		}
	};


	return (
		<div>
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
						<TableCard {...tableProps} />
					</div>
				</Column>
			</Container>
		</div>
	);
};

export default WholesaleUser;