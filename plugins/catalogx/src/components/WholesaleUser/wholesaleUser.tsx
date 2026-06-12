import React, { useState } from 'react';

import '../common.scss';

import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { defaultCategoryCounts, dummyWholesalecustomer } from './WholesaleUserUtil';

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
		action: {
			type: 'action',
			label: __('Action', 'catalogx'),
			actions: [
				{
					label: () => __('View', 'catalogx'),
					icon: () => 'eye',
					onClick: () => setopenPopup(true)
				},
				{
					label: () => __('Approve', 'catalogx'),
					icon: () => 'check',
					onClick: () => setopenPopup(true)
				},
				{
					label: () => __('Reject', 'catalogx'),
					icon: () => 'close',
					onClick: () => setopenPopup(true)
				},
			],
		},
	};
	const filters = [{
		key: 'date',
		label: __('Date Range', 'catalogx'),
		type: 'date',
	}];
	const bulkActions = [
		{ label: __('Approve', 'catalogx'), value: 'approve' },
		{ label: __('Reject', 'catalogx'), value: 'reject' },
		{ label: __('Pending', 'catalogx'), value: 'pending' },
	];
	const defaultTableProps = {
		headers,
		format: appLocalizer.date_format,
		filters,
		search: {
			placeholder: __('Search...', 'catalogx'),
			size: 8,
		},
		bulkActions,
		onBulkActionApply: () => setopenPopup(true),
		onQueryUpdate: () => setopenPopup(true),
		categoryCounts: defaultCategoryCounts,
		rows: dummyWholesalecustomer,
		totalRows: dummyWholesalecustomer.length,
	};

	tableProps = applyFilters(
		'catalogx_wholesale_user_table_component',
		defaultTableProps
	);

	const handleTableWrapperClick = () => {
		if (!appLocalizer.khali_dabba || !appLocalizer.active_modules.includes('wholesale')) {
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
					{!appLocalizer.khali_dabba ? (
						<ShowProPopup />
					) : (
						<ShowProPopup moduleName="wholesale" />
					)}
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
						{tableProps.selectedRow && tableProps.viewWholesaleDetails}
					</div>
				</Column>
			</Container>
		</div>
	);
};

export default WholesaleUser;