import React, { useState } from 'react';

import '../common.scss';

import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { defaultCategoryCounts, dummyWholesalecustomer } from './WholesaleUserUtil';


import {
	LayoutColumnComponent,
	ContainerComponent,
	InformationItemComponent,
	PopupComponent,
	ComponentStatusComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard } from '@zyra/table';

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
				<InformationItemComponent
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
			type: 'status',
			statusClass: (row: WholesaleUserRow) => `${row.status}`
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
				},
				{
					label: () => __('Approve', 'catalogx'),
					icon: () => 'check'
				},
				{
					label: () => __('Reject', 'catalogx'),
					icon: () => 'close'
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
		categoryCounts: defaultCategoryCounts,
		rows: dummyWholesalecustomer,
		totalRows: dummyWholesalecustomer.length,
	};

	tableProps = applyFilters(
		'catalogx_wholesale_user_table_component',
		defaultTableProps
	);

	const renderTableContent = () => {
		if (!appLocalizer.khali_dabba) {
			return (
				<div className="demo-wrapper" onClick={() => setopenPopup(true)}>
					<div className="watermark">{__('This is sample Data','catalogx' )}</div>
					<TableCard {...tableProps} />
				</div>
			);
		}

		if (!appLocalizer.active_modules.includes('wholesale')) {
			return (
				<ComponentStatusComponent
					title={__(
						'Looks like wholesale pricing isn’t set up yet!',
						'catalogx'
					)}
					desc={__(
						'Enable the Wholesale module to create wholesale pricing and offer special rates to your business customers.',
						'catalogx'
					)}
					buttonText={__('Enable Now', 'catalogx')}
					buttonLink={`${appLocalizer.admin_url}#&tab=modules&module=wholesale`}
				/>
			);
		}

		return (
			<>
				<TableCard {...tableProps} />
				{tableProps.selectedRow && tableProps.viewWholesaleDetails}
			</>
		);
	};

	return (
		<>
			{openPopup && (
				<PopupComponent
					position="lightbox"
					open={openPopup}
					onClose={() => setopenPopup(false)}
					width={31.25}
					height="auto"
				>
					<ShowProPopup />
				</PopupComponent>
			)}
			<NavigatorHeaderComponent
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

			<ContainerComponent general>
				<LayoutColumnComponent>
					{renderTableContent()}
				</LayoutColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default WholesaleUser;