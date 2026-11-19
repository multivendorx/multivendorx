import React from 'react';

import '../common.scss';

import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { defaultCategoryCounts, dummyWholesalecustomer } from './WholesaleUserUtil';


import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard } from '@zyra/table';

import ListGate from '../Popup/ListGate';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { formatDate } from '../../services/commonFunction';

export interface WholesaleUserRow {
	id?: number;
	customer?: string;
	email?: string;
	status?: string;
	date?: string;
	action?: string;
	customer_url?: string;
}

const WholesaleUser = () => {
	let tableProps: any;

	const headers = {
		customer: {
			label: __('User', 'catalogx'),
			type: 'info',
			iconKey: 'info_icon',
			titleLinkKey: 'customer_url',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
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
		variant: 'transparent',
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

	/** Adds what the user column draws (icon, email line, status and date badges) to each row. */
	const withUserColumn = (rows: WholesaleUserRow[]) =>
		rows.map((row) => ({
			...row,
			info_icon: 'person',
			info_descriptions: [
				{
					label: __('Email', 'catalogx'),
					icon: 'mail',
					value: row.email || '—',
				},
			],
			info_badges: [
				{
					text: row.status,
					color: `badge-${row.status?.toLowerCase()}`,
				},
				{ text: formatDate(row.date), color: 'blue' },
			],
		}));

	const { props: filteredProps, hasNoRecords } = useNoRecordsYet(
		applyFilters(
			'catalogx_wholesale_user_table_component',
			defaultTableProps
		) as typeof defaultTableProps & Record<string, any>
	);
	tableProps = {
		...filteredProps,
		rows: withUserColumn(filteredProps.rows || []),
	};

	/** The sample rows drawn behind every card: the plugin's own, never the filtered (real) props. */
	const sampleRows = withUserColumn(dummyWholesalecustomer.slice(0, 4));
	const sampleTable = (
		<TableCard
			{...defaultTableProps}
			rows={sampleRows}
			totalRows={sampleRows.length}
		/>
	);

	return (
		<>
			<NavigatorHeaderComponent
				headerIcon="wholesale"
				headerDescription={__(
					'Wholesale users are displayed with account details and statuses to help manage approvals and customer access.',
					'catalogx'
				)}
				headerTitle={__('Wholesale Users', 'catalogx')}
			/>

			<ContainerComponent general>
				<ColumnComponent>
					<ListGate
						feature={{
							title: __('Wholesale Users', 'catalogx'),
							description: __(
								'Approve wholesale applications and give each buyer their own prices, minimums and order form.',
								'catalogx'
							),
							icon: 'wholesale',
						}}
						module={{
							id: 'wholesale',
							name: __('Wholesale', 'catalogx'),
						}}
						sample={sampleTable}
						isEmpty={hasNoRecords}
						empty={{
							heading: __('No wholesale buyers yet', 'catalogx'),
							description: __(
								'Buyers apply through the wholesale registration form. Each application lands here for you to approve or reject.',
								'catalogx'
							),
							actions: (
								<>
									<a
										className="cx-locked-button"
										href="#&tab=settings&subtab=wholesale"
									>
										{__('Wholesale settings', 'catalogx')}
									</a>
									<a
										className="cx-locked-link"
										href="#&tab=settings&subtab=pages-shortcodes"
									>
										{__('Registration page', 'catalogx')}
									</a>
								</>
							),
							note: __(
								'A preview with sample buyers. Yours show here once they apply.',
								'catalogx'
							),
						}}
					>
						<TableCard {...tableProps} />
						{tableProps.selectedRow && tableProps.viewWholesaleDetails}
					</ListGate>
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default WholesaleUser;
